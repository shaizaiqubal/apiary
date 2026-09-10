import json
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from backend.app.dependencies import get_current_user_id
from sqlalchemy import select
from backend.database import SessionLocal
from backend.models import Sighting, Species, Plot
from backend.app.services.verification import verify_sighting
from backend.app.services.storage import delete_image, upload_image
from backend.app.routers.users import get_user_or_404
from backend.app.dependencies import update_milestone, get_image_hash
from backend.app.services.image_validation import validate_image_content_type, validate_image_size
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
        
        content_type = validate_image_content_type(photo)
        image_bytes = await photo.read()
        validate_image_size(image_bytes)
        extension = content_type.split("/")[-1]
        image_hash = get_image_hash(image_bytes)
        object_name = f"submissions/{image_hash}.{extension}"

        duplicate = db.execute(
            select(Sighting)
            .join(Plot, Sighting.plot_id == Plot.id)
            .where(
                Sighting.image_hash == image_hash,
                Sighting.verified_status == "confirmed",
                Plot.user_id == user_id,
            )
        ).scalar_one_or_none()

        if duplicate:
             return {"status":"declined", "reason":"already_submitted"}

        pending_attempt = db.execute(
            select(Sighting)
            .join(Plot, Sighting.plot_id == Plot.id)
            .where(
                Sighting.image_hash == image_hash,
                Sighting.verified_status == "pending",
                Plot.user_id == user_id,
            )
        ).scalar_one_or_none()

        if pending_attempt:
            return {
                "status": "accepted",
                "candidates": json.loads(pending_attempt.candidate_species_json or "[]"),
                "sighting_id": pending_attempt.id,
            }

        image_verify = verify_sighting(image_bytes, content_type) 

        if image_verify.status != "verified":
             return {"status": "not_a_bee", "reason": image_verify.reasoning}

        upload_image(image_bytes, object_name, content_type)

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
                image_hash = image_hash,
                image_key = object_name,
                latitude = plot.latitude,
                longitude = plot.longitude,        
                candidate_species_json = candidates_json
        )
        db.add(sighting_record)
        try:
            db.commit()
        except Exception:
            db.rollback()
            delete_image(object_name)
            raise
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
user_id: str = Depends(get_current_user_id)) -> SightingSchema:
    with SessionLocal() as db:
        sighting = db.execute(select(Sighting).where(Sighting.id == sighting_id)).scalar_one_or_none()

        if not sighting:
            raise HTTPException(
                 status_code=status.HTTP_404_NOT_FOUND,
                 detail="Sighting Not Found"
                )

        if sighting.verified_status != "pending":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Sighting has already been confirmed or rejected",
            )
             
        species = db.execute(select(Species).where(Species.species_id == species_id)).scalar_one_or_none()

        if not species:
            raise HTTPException(
                 status_code=status.HTTP_404_NOT_FOUND,
                 detail="Species Not Found"
                )

        plot = db.execute(
            select(Plot).where(
                Plot.id == sighting.plot_id,
                Plot.user_id == user_id,
            )
        ).scalar_one_or_none()

        if not plot:
            raise HTTPException(status_code=404, detail="Plot Not Found")

        candidates = json.loads(sighting.candidate_species_json or "[]")
        candidate_ids = {candidate["species_id"] for candidate in candidates}
        if species_id not in candidate_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected species was not one of the identified candidates",
            )
        
        found = db.execute(
                select(Sighting)
                .join(Plot, Sighting.plot_id == Plot.id)
                .where(
                    Plot.user_id == user_id,
                    Sighting.species_id == species_id,
                    Sighting.verified_status == "confirmed",
                )).scalar_one_or_none()
        if found:
            sighting.points_awarded = 5
        else:
            sighting.points_awarded = species.points

        sighting.species_id = species.species_id
        sighting.species = species
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

        return SightingSchema(
            id=sighting.id,
            plot_id=sighting.plot_id,
            species_id=sighting.species_id,
            latitude=sighting.latitude,
            longitude=sighting.longitude,
            timestamp=sighting.timestamp,
            candidate_species_json=sighting.candidate_species_json,
            verified_status=sighting.verified_status,
            points_awarded=sighting.points_awarded,
            species_name=species.common_name,
        )
