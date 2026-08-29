import base64
import json
import os
from pathlib import Path
from google import genai
from pydantic import BaseModel
from typing import Literal
from dotenv import load_dotenv
from backend.database import SessionLocal
from sqlalchemy.sql import select
from backend.models import Species

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
_PROMPT_DIR = Path(__file__).resolve().parent

class VerifyQuest(BaseModel):
    status: Literal["verified", "rejected"]
    reasoning : str

class CandidateSpecies(BaseModel):
    species_id: int
    species_name: str
    common_name: str
    confidence: float

class CandidateList(BaseModel):
    status : Literal["verified","not_a_bee"]
    reasoning : str
    candidates: list[CandidateSpecies] | None

SYSTEM_PROMPT = (_PROMPT_DIR / "system_prompt.txt").read_text(encoding="utf-8").strip()


def _build_species_list_json() -> str:
    with SessionLocal() as db:
        res = db.execute(
            select(Species.species_id, Species.scientific_name, Species.common_name)
        ).all()

    species_list = [
        {
            "species_id": r.species_id,
            "species_name": r.scientific_name,
            "common_name": r.common_name,
        }
        for r in res
    ]
    return json.dumps(species_list, indent=2)

def verify_quest(image_bytes: bytes, mime_type: str, expected: str) -> dict:
    return {
        "status": "verified",
        "reasoning": "Temporary verification accepted the image.",
    }


def verify_sighting(image_bytes: bytes, mime_type: str) -> CandidateList:
    with SessionLocal() as db:
        species = db.execute(select(Species).order_by(Species.species_id)).scalars().first()

    if species is None:
        raise RuntimeError("No species available for temporary sighting verification")

    return CandidateList(
        status="verified",
        reasoning="Temporary verification accepted the image.",
        candidates=[
            CandidateSpecies(
                species_id=species.species_id,
                species_name=species.scientific_name,
                common_name=species.common_name,
                confidence=1.0,
            )
        ],
    )
    
