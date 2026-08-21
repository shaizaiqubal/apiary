from fastapi import APIRouter, Depends, HTTPException,status
from backend.app.dependencies import get_current_user_id
from sqlalchemy import select
from backend.database import SessionLocal
from backend.models import Species, Sighting, Plot
from backend.schemas import SpeciesSchema

router = APIRouter(prefix="/beedex", tags=["beedex"])

@router.get("",response_model=list[SpeciesSchema])
def get_beedex()-> list[Species]: 
    with SessionLocal() as db:
        res = db.execute(select(Species).order_by(Species.species_id)).scalars().all()
        return [species for species in res]


@router.get("/{species_id}", response_model=SpeciesSchema)
def get_species(species_id: int) -> Species: 
    with SessionLocal() as db:
        res = db.execute(select(Species).where(Species.species_id == species_id)).scalar_one_or_none()
        if res is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Species Not Found"
            )
        return res

@router.get("/user", response_model=list[SpeciesSchema])
def get_user_beedex(user_id: str = Depends(get_current_user_id)) -> list[Species]: 
    with SessionLocal() as db:
        plots = db.execute(select(Plot).where(Plot.user_id == user_id)).scalars().all()
        if not plots:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No plots found for the user"
            )
        
        plot_ids = [plot.id for plot in plots]

        sightings = db.execute(select(Sighting).where(Sighting.plot_id.in_(plot_ids))).scalars().all()

        # Extract unique species from sightings
        unique_species_ids = {sighting.species_id for sighting in sightings}
        species_list = db.execute(select(Species).where(Species.species_id.in_(unique_species_ids))).scalars().all()

        if not species_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No species found for the user"
            )

        return [species for species in species_list]