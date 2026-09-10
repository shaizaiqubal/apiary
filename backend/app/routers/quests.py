from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from backend.database import SessionLocal
from backend.models import Plot, Plant, Nesting, Quest
from backend.app.dependencies import get_current_user_id
from backend.app.dependencies import update_milestone
from backend.app.services.get_quests import get_plant_quests, get_nesting_quests
from backend.app.routers.users import get_user_or_404
from backend.app.services.verification import verify_quest
from backend.app.services.image_validation import validate_image_content_type, validate_image_size
from backend.schemas import QuestLogResponse, QuestOptionsSchema, QuestSchema

router = APIRouter(prefix='/quests',tags=["quests"])


@router.post("", response_model=QuestLogResponse)
async def log_quest(
    plot_id: str = Form(...),
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
            found = db.execute(select(Quest).where(
                Quest.plot_id == plot_id,
                Quest.plant_id == plant_id,
                Quest.verified_status == "verified",
            )).scalar_one_or_none()
            if plant:
                expected = f"planting {plant.common_name or plant.plant_name}"
                if found:
                    points = 5
                else:
                    points = plant.points
            else:
                raise HTTPException(status_code=404, detail="Plant not found")
        else:
            action = db.execute(select(Nesting).where(Nesting.action_id == action_id)).scalar_one_or_none()
            found = db.execute(select(Quest).where(
                Quest.plot_id == plot_id,
                Quest.action_id == action_id,
                Quest.verified_status == "verified",
            )).scalar_one_or_none()

            if action:
                expected = action.action
                if found:
                    points = 5
                else:
                    points = action.points
            else:
                raise HTTPException(status_code=404, detail="Action not found")

        if expected is None:
            raise HTTPException(status_code=400, detail="No expected identifier available")

        content_type = validate_image_content_type(photo)
        image_bytes = await photo.read()
        validate_image_size(image_bytes)
        result = verify_quest(image_bytes, content_type, expected)

        if result["status"] != "verified":
            return {"quest": None, "result": result}

        awarded_points = points
        quest = Quest(
            plot_id=plot_id,
            plant_id=plant_id,
            action_id=action_id,
            verified_status="verified",
            points_awarded=awarded_points,
        )
        db.add(quest)

        plot.points += awarded_points

        db.commit()
        db.refresh(quest)
        db.refresh(plot)
        update_milestone(plot_id, user_id, db)

    quest_response = QuestSchema(
        id=quest.id,
        plot_id=quest.plot_id,
        plant_id=quest.plant_id,
        action_id=quest.action_id,
        date_completed=quest.date_completed,
        photo_url=quest.photo_url,
        verified_status=quest.verified_status,
        points_awarded=quest.points_awarded,
        plant_name=plant.common_name if plant_id else None,
        action=action.action if action_id else None,
    )

    return {"quest": quest_response, "result": result}

@router.get('/plot/{plot_id}', response_model=QuestOptionsSchema)
def get_plot_quests(plot_id: str, user_id: str = Depends(get_current_user_id)) -> dict:
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
