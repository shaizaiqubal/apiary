from __future__ import annotations

import datetime
from datetime import date

from pydantic import BaseModel, ConfigDict


class SpeciesSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    species_id: int
    common_name: str
    scientific_name: str
    rarity_tier: str
    points: int
    fun_facts: str


class PlotSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    latitude: float
    longitude: float
    sun_shade: str
    plot_type: int
    area_sq_m: float | None
    milestone: str
    points: int
    created: datetime.datetime

class SightingSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    plot_id: int
    species_id: int | None
    latitude: float
    longitude: float
    timestamp: datetime.datetime
    candidate_species_json: str | None
    verified_status: str
    points_awarded: int
