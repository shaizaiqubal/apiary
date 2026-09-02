import base64
import json
import os
from pathlib import Path
from google import genai
from pydantic import BaseModel, Field
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
    candidates: list[CandidateSpecies] | None = Field(default=None, min_length=3, max_length=3)

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
    try:
        if not API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set")

        client = genai.Client(api_key=API_KEY)
        quest_prompt = f"""
        Verify that the following image contains the expected content.
        Expected: {expected}
        Respond with this exact JSON structure:
        {{
        "status": "verified" | "rejected",
        "reasoning": "one sentence"
        }}
        """.strip()

        interaction = client.interactions.create(
            model="gemini-3.1-flash-lite",
            input=[
                {
                    "type": "text",
                    "text": quest_prompt
                    
                },
                {
                    "type": "image",
                    "data": base64.b64encode(image_bytes).decode("utf-8"),
                    "mime_type": mime_type,
                },
            ],
            system_instruction= SYSTEM_PROMPT,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": VerifyQuest.model_json_schema(),
            },
            stream=False,
        )

        result = VerifyQuest.model_validate_json(interaction.output_text)  # type: ignore
        return result.model_dump()  
    except Exception as exc:
        raise RuntimeError(f"Image verification failed: {exc}") from exc


def verify_sighting(image_bytes: bytes, mime_type: str) -> CandidateList:
    try:
        if not API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set")

        client = genai.Client(api_key=API_KEY)
        species_list_json = _build_species_list_json()
        bee_prompt = f"""
        Analyze the attached image and identify the bee species. You must cross-reference your identification strictly against this allowed list of species:
        {species_list_json}
        Follow these exact steps:
        1. Verify if the subject in the photo is actually a bee. Be careful to exclude lookalikes such as hoverflies, wasps, and bee-flies. If it is not a valid photo of a bee, return status as not_a_bee.
        2. If it is a bee, attempt to identify the species based on visible physical characteristics (e.g. pile color, banding, tail color, pollen-carrying structures).
        3. Check if your identified species is present on the allowed list.
        4. Only use ids and names present in the allowed list. Do not invent anything not already present in the list.
        For a valid bee, return exactly 3 distinct candidates ordered from highest to lowest confidence. If fewer than 3 species can be distinguished confidently, return the 3 best allowed candidates and reflect uncertainty in the reasoning.

        Output your final assessment exclusively as a minified JSON object. Use this schema:
        {{
        "status": "verified" | "not_a_bee",
        "reasoning": "brief explanation of your assessment",
        "candidates": [
            {{
            "species_id": integer,
            "species_name": "scientific name",
            "common_name": "common name",
            "confidence": float between 0 and 1
            }}
        ] | None
        }}
        Use "not_a_bee" as status if the photo does not show a bee at all, for example if it's blurry, empty, shows a wasp, fly, other insect, or is unrelated, and in that case candidates must be None.
        """.strip()

        interaction = client.interactions.create(
            model="gemini-3.1-flash-lite",
            input=[
                {
                    "type": "text",
                    "text": bee_prompt
                },
                {
                    "type": "image",
                    "data": base64.b64encode(image_bytes).decode("utf-8"),
                    "mime_type": mime_type,
                },
            ],
            system_instruction= SYSTEM_PROMPT,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": CandidateList.model_json_schema(),
            },
            stream=False,
        )

        return CandidateList.model_validate_json(interaction.output_text) #type: ignore
    
    except Exception as exc:
        raise RuntimeError(f"Image verification failed: {exc}") from exc
    