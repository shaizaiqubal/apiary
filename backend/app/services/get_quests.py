from random import choice

from sqlalchemy.orm import Session
from sqlalchemy.sql import func, select
from backend.models import Plant, Nesting, Plot, Quest
from backend.app.services.region import get_region_bucket, hardiness_meets_bucket

STRICT_MILESTONES = ("seedling", "garden")


def _sun_shade_matches(plant_sun_shade: str, user_sun_shade: str) -> bool:
    if not plant_sun_shade:
        return False
    options = [s.strip().lower().replace("_", " ") for s in plant_sun_shade.split("|")]
    requested = user_sun_shade.strip().lower().replace("_", " ")
    return requested in options


def get_plant_quests(db: Session, plot: Plot) -> Plant | None:
    """
    Lookup: region (via hardiness) + sun_shade + plot_type + milestone -> next plant.
    plot_type is a MINIMUM requirement (a plant needing plot_type 1 fits any bigger plot),
    strictly enforced at Seedling/Garden, soft-gated at Habitat/Sanctuary so users never
    hit a dead end at the top of progression. 
    """
    bucket = get_region_bucket(plot.latitude)

    candidates = db.execute(
        select(Plant).where(func.lower(Plant.milestone) == func.lower(plot.milestone))
    ).scalars().all()

    completed_plant_quests = set(
        db.execute(
            select(Quest.plant_id).where(
                Quest.plot_id == plot.id,
                Quest.verified_status == "verified",
                Quest.plant_id.is_not(None),
            )
        ).scalars()
    )
    candidates = [
        p for p in candidates
        if p.plant_id not in completed_plant_quests
        and hardiness_meets_bucket(p.hardiness, bucket)
        and _sun_shade_matches(p.sun_shade, plot.sun_shade)
    ]

    if plot.milestone.lower() in STRICT_MILESTONES:
        pool = [p for p in candidates if p.plot_type <= plot.plot_type]
        selected = choice(pool) if pool else None
        return selected

    # Habitat / Sanctuary: prefer a fit, fall back to anything at this milestone
    fitting = [p for p in candidates if p.plot_type <= plot.plot_type]
    pool = fitting if fitting else candidates
    selected = choice(pool) if pool else None
    return selected


def get_nesting_quests(db: Session, plot: Plot) -> Nesting | None:
    candidates = db.execute(
        select(Nesting).where(func.lower(Nesting.milestone) == func.lower(plot.milestone))
    ).scalars().all()
    completed_action_quests = set(
        db.execute(
            select(Quest.action_id).where(
                Quest.plot_id == plot.id,
                Quest.verified_status == "verified",
                Quest.action_id.is_not(None),
            )
        ).scalars()
    )
    if plot.milestone.lower() in STRICT_MILESTONES:
        pool = [a for a in candidates
            if a.action_id not in completed_action_quests
            and a.plot_type <= plot.plot_type]
        selected = choice(pool) if pool else None
        return selected

    fitting = [a for a in candidates 
               if a.action_id not in completed_action_quests
               and a.plot_type <= plot.plot_type]
    pool = fitting if fitting else [
        action for action in candidates
        if action.action_id not in completed_action_quests
    ]
    selected = choice(pool) if pool else None
    return selected
