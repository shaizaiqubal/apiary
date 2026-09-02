from fastapi import APIRouter, Depends, HTTPException,status
from backend.app.dependencies import get_current_user_id
from sqlalchemy import select
from backend.database import SessionLocal
from backend.models import Species, Sighting, Plot
from backend.schemas import SpeciesSchema, UserSpeciesSchema
from backend.app.services.storage import get_signed_image_url

router = APIRouter(prefix="/beedex", tags=["beedex"])

@router.get("",response_model=list[SpeciesSchema])
def get_beedex()-> list[Species]: 
    with SessionLocal() as db:
        res = db.execute(select(Species).order_by(Species.species_id)).scalars().all()
        return [species for species in res]


@router.get("/user", response_model=list[UserSpeciesSchema])
def get_user_beedex(user_id: str = Depends(get_current_user_id)) -> list[UserSpeciesSchema]: 
    with SessionLocal() as db:
        plots = db.execute(select(Plot).where(Plot.user_id == user_id)).scalars().all()
        if not plots:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No plots found for the user"
            )
        
        plot_ids = [plot.id for plot in plots]

        sightings = db.execute(
                    select(Sighting)
                    .where(
                        Sighting.plot_id.in_(plot_ids),
                        Sighting.verified_status == "confirmed",
                        Sighting.species_id.is_not(None),
                    )
                    .order_by(Sighting.timestamp.desc())
                ).scalars().all()
        
        latest_sightings = {}
        for sighting in sightings:
            if sighting.species_id not in latest_sightings:
                latest_sightings[sighting.species_id] = sighting

        species_list = db.execute(
            select(Species)
            .where(Species.species_id.in_(latest_sightings))
            .order_by(Species.species_id)
        ).scalars().all()

        if not species_list:
            return []

        result = []
        for species in species_list:
            sighting = latest_sightings[species.species_id]
            image_url = get_signed_image_url(sighting.image_key)
            latest_image = None
            if image_url:
                latest_image = {
                    "url": image_url,
                    "sighting_id": sighting.id,
                    "timestamp": sighting.timestamp,
                }

            result.append({
                "species_id": species.species_id,
                "common_name": species.common_name,
                "scientific_name": species.scientific_name,
                "rarity_tier": species.rarity_tier,
                "points": species.points,
                "fun_facts": species.fun_facts,
                "latest_image": latest_image,
            })

        return result


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