from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.database import SessionLocal
from backend.models import Plot, Quest, Sighting
from pydantic import BaseModel
from backend.app.dependencies import get_current_user_id
from backend.app.routers.users import get_user_or_404
from backend.schemas import PlotSchema

router = APIRouter(prefix="/plots", tags=["plots"])

class CreatePlot(BaseModel):
    plot_name: str
    latitude: float
    longitude: float
    sun_shade: str      
    plot_type: int       
    area_sq_m: float | None = None

@router.post('/create',response_model=PlotSchema)
def create_plot(plot: CreatePlot, user_id: str = Depends(get_current_user_id)) -> Plot:
    with SessionLocal() as db:
        get_user_or_404(db, user_id)
        new_plot = Plot(
            user_id=user_id,
            plot_name=plot.plot_name,
            latitude=plot.latitude,
            longitude=plot.longitude,
            sun_shade=plot.sun_shade,
            plot_type=plot.plot_type,
            area_sq_m=plot.area_sq_m
        )
        db.add(new_plot)
        db.commit()
        db.refresh(new_plot)
        new_plot.quests
        new_plot.sightings

    return new_plot

@router.get("", response_model=list[PlotSchema])
def get_user_plots(user_id: str = Depends(get_current_user_id)) -> list[Plot]:
    with SessionLocal() as db:
        get_user_or_404(db, user_id)

        stmt = (
            select(Plot)
            .options(
                selectinload(Plot.quests),
                selectinload(Plot.quests).selectinload(Quest.plant),
                selectinload(Plot.quests).selectinload(Quest.nesting_action),
                selectinload(Plot.sightings),
                selectinload(Plot.sightings).selectinload(Sighting.species),
            )
            .where(Plot.user_id == user_id)
        )
        res = db.execute(stmt).scalars().all()

    return [plot for plot in res]

@router.get('/{plot_id}',response_model=PlotSchema)
def get_plot(plot_id: int, user_id: str = Depends(get_current_user_id)) -> Plot:
    with SessionLocal() as db:
        get_user_or_404(db, user_id)

        stmt = (
            select(Plot)
            .options(
                selectinload(Plot.quests),
                selectinload(Plot.quests).selectinload(Quest.plant),
                selectinload(Plot.quests).selectinload(Quest.nesting_action),
                selectinload(Plot.sightings),
                selectinload(Plot.sightings).selectinload(Sighting.species),
            )
            .where(Plot.id == plot_id, Plot.user_id == user_id)
        )
        res = db.execute(stmt).scalar_one_or_none()

    if res is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plot Not Found"
        )

    return res



@router.get('/map/all', response_model=list[dict])
def get_plot_map() -> list[dict]:
    with SessionLocal() as db:
        plots = db.execute(select(Plot)).scalars().all()
    return [
        {
            "id": p.id,
            "plot_name": p.plot_name,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "milestone": p.milestone,
        }
        for p in plots
    ]
