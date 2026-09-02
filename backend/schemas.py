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


class LatestImageSchema(BaseModel):
    url: str
    sighting_id: str
    timestamp: datetime.datetime


class UserSpeciesSchema(SpeciesSchema):
    latest_image: LatestImageSchema | None = None


class PlantQuestSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    plant_id: int
    common_name: str
    plant_name: str
    native_status: str
    sun_shade: str
    plot_type: int
    area_reqd: float
    bloom_season: str
    milestone: str
    hardiness: str
    points: int
    notes: str
    rhs_link: str


class NestingQuestSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action_id: int
    action: str
    plot_type: int
    milestone: str
    points: int
    notes: str
    steps: str
    url: str


class QuestOptionsSchema(BaseModel):
    plot_id: int
    plot_milestone: str
    plant_quest: PlantQuestSchema | None
    nesting_quest: NestingQuestSchema | None


class QuestSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plot_id: int
    plant_id: int | None
    action_id: int | None
    date_completed: date
    photo_url: str | None
    verified_status: str
    points_awarded: int


class QuestLogResponse(BaseModel):
    quest: QuestSchema
    result: dict


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


class PlotSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    plot_name: str
    latitude: float
    longitude: float
    sun_shade: str
    plot_type: int
    area_sq_m: float | None
    milestone: str
    points: int
    created: datetime.datetime
    quests: list[QuestSchema]
    sightings: list[SightingSchema]
