from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from backend.database import SessionLocal
from backend.models import Plot, Plant, Nesting, Quest
from backend.app.dependencies import get_current_user_id
from backend.app.dependencies import update_milestone
from backend.app.services.get_quests import get_plant_quests, get_nesting_quests
from backend.app.routers.users import get_user_or_404
from backend.app.services.verification import verify_quest

router = APIRouter(prefix='/quests',tags=["quests"])


@router.post("", response_model=dict)
async def log_quest(
    plot_id: int = Form(...),
    plant_id: int | None = Form(None),
    action_id: int | None = Form(None),
    photo: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    with SessionLocal() as db:
        get_user_or_404(db, user_id)

        if not plant_id and not action_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide plant_id or action_id",
            )

        if bool(plant_id) and bool(action_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can't have both plant_id and action_id at once",
            )

        points = 0
        expected: str | None = None

        plot = db.execute(
            select(Plot).where(
                Plot.user_id == user_id,
                Plot.id == plot_id,
            )
        ).scalar_one_or_none()

        if not plot:
            raise HTTPException(status_code=404, detail="Plot not found")

        if plant_id:
            plant = db.execute(select(Plant).where(Plant.plant_id == plant_id)).scalar_one_or_none()
            if plant:
                expected = f"planting {plant.common_name or plant.plant_name}"
                points = plant.points
            else:
                raise HTTPException(status_code=404, detail="Plant not found")
        else:
            action = db.execute(select(Nesting).where(Nesting.action_id == action_id)).scalar_one_or_none()
            if action:
                expected = action.action
                points = action.points
            else:
                raise HTTPException(status_code=404, detail="Action not found")

        if expected is None:
            raise HTTPException(status_code=400, detail="No expected identifier available")

        image_bytes = await photo.read()
        result = verify_quest(image_bytes, photo.content_type, expected)  # type: ignore

        quest = Quest(
            plot_id=plot_id,
            plant_id=plant_id,
            action_id=action_id,
            verified_status="verified" if result["status"] == "verified" else "rejected",
            points_awarded=points if result["status"] == "verified" else 0,
        )
        db.add(quest)

        if result["status"] == "verified":
            plot.points += points

        db.commit()
        db.refresh(quest)
        db.refresh(plot)
        update_milestone(plot_id, user_id, db)

    return {"quest": quest, "result": result}

@router.get('/plot/{plot_id}',response_model=dict)
def get_plot_quests(plot_id: int, user_id: str = Depends(get_current_user_id)) -> dict:
    with SessionLocal() as db:
        plot = db.execute(select(Plot).where(Plot.id == plot_id, Plot.user_id == user_id)).scalar_one_or_none()
        if plot is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plot Not Found"
            )

        plant_quest = get_plant_quests(db, plot)
        nesting_quest = get_nesting_quests(db, plot)

        return {
            "plot_id": plot_id,
            "plot_milestone": plot.milestone,
            "plant_quest": plant_quest,
            "nesting_quest": nesting_quest,
        }
