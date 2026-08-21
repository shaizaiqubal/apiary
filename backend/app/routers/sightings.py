import json
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from backend.app.dependencies import get_current_user_id
from sqlalchemy import select
from backend.database import SessionLocal
from backend.models import Sighting, Species, Plot
from backend.app.services.verification import verify_sighting
from backend.app.services.storage import upload_image
from backend.app.routers.users import get_user_or_404
from backend.app.dependencies import update_milestone, get_image_hash
from backend.schemas import SightingSchema

router = APIRouter(prefix="/sightings", tags=["sightings"])

@router.post("")
async def post_sightings(
    plot_id: int = Form(...),
    user_id: str = Depends(get_current_user_id),
    photo: UploadFile = File(...),
) -> dict:

    with SessionLocal() as db:
        get_user_or_404(db, user_id)

        plot = db.execute(select(Plot).where(Plot.id == plot_id, Plot.user_id == user_id)).scalar_one_or_none()
    
        if not plot:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Plot Not Found"
                )
        
        if not photo.content_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing photo content type",
            )

        image_bytes = await photo.read()
        content_type = photo.content_type
        extension = content_type.split("/")[-1]
        hash = get_image_hash(image_bytes)
        object_name = f"submissions/{hash}.{extension}"

        duplicate = db.execute(select(Sighting).where(Sighting.image_hash == hash)).scalar_one_or_none()

        if duplicate:
             return {"status":"declined", "reason":"image_already_exists"}

        upload = upload_image(image_bytes,object_name,content_type)

        if not upload:
            print("Image storage failed")

        image_verify = verify_sighting(image_bytes, content_type) 

        if image_verify.status == "not_a_bee":
             return {"status": "not_a_bee", "reason": image_verify.reasoning}

        candidates_json = None
        if image_verify.candidates is not None:
            candidates_json = json.dumps(
                [candidate.model_dump() for candidate in image_verify.candidates],
                indent=2,
            )
        sighting_id = str(uuid.uuid4())
        sighting_record = Sighting(
                id = sighting_id,
                plot_id = plot.id,
                species_id = None,
                image_hash = hash,
                image_key = object_name,
                latitude = plot.latitude,
                longitude = plot.longitude,        
                candidate_species_json = candidates_json
        )
        db.add(sighting_record)
        db.commit()
        db.refresh(sighting_record)
    
    return {
        "status": "accepted",
        "candidates": [candidate.model_dump() for candidate in image_verify.candidates]
        if image_verify.candidates is not None
        else None,
        "sighting_id": sighting_id,
    }

@router.post("/{sighting_id}/confirm",response_model=SightingSchema)
def log_sighting(
species_id : int, 
sighting_id: str,
user_id: str = Depends(get_current_user_id)) -> Sighting:
    with SessionLocal() as db:
        sighting = db.execute(select(Sighting).where(Sighting.id == sighting_id)).scalar_one_or_none()

        if not sighting:
            raise HTTPException(
                 status_code=status.HTTP_404_NOT_FOUND,
                 detail="Sighting Not Found"
                )
             
        species = db.execute(select(Species).where(Species.species_id == species_id)).scalar_one_or_none()

        if not species:
            raise HTTPException(
                 status_code=status.HTTP_404_NOT_FOUND,
                 detail="Species Not Found"
                )
        found = db.execute(select(Sighting).where(Sighting.species_id== species_id, Sighting.verified_status == "confirmed")).scalar_one_or_none()
        if found:
            sighting.points_awarded = 5
        else:
            sighting.points_awarded = species.points

        sighting.species_id = species.species_id
        sighting.verified_status = "confirmed"

        plot = db.execute(
            select(Plot).where(
                Plot.id == sighting.plot_id,
                Plot.user_id == user_id,
            )
        ).scalar_one_or_none()
        if not plot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plot Not Found"
            )

        plot.points += sighting.points_awarded

        update_milestone(plot.id, user_id, db)

        db.commit()
        db.refresh(sighting)

        return sighting
