from sqlalchemy.orm import Session
from sqlalchemy.sql import select
from backend.models import Plant, Nesting, Plot
from backend.app.services.region import get_region_bucket, hardiness_meets_bucket

STRICT_MILESTONES = ("Seedling", "Garden")


def _sun_shade_matches(plant_sun_shade: str, user_sun_shade: str) -> bool:
    if not plant_sun_shade:
        return False
    options = [s.strip().lower() for s in plant_sun_shade.split("|")]
    return user_sun_shade.strip().lower() in options


def get_plant_quests(db: Session, plot: Plot) -> Plant | None:
    """
    Lookup: region (via hardiness) + sun_shade + plot_type + milestone -> next plant.
    plot_type is a MINIMUM requirement (a plant needing plot_type 1 fits any bigger plot),
    strictly enforced at Seedling/Garden, soft-gated at Habitat/Sanctuary so users never
    hit a dead end at the top of progression. 
    """
    bucket = get_region_bucket(plot.latitude)

    candidates = db.execute(select(Plant).where(Plant.milestone == plot.milestone)).scalars().all()

    candidates = [
        p for p in candidates
        if hardiness_meets_bucket(p.hardiness, bucket)
        and _sun_shade_matches(p.sun_shade, plot.sun_shade)
    ]

    if plot.milestone in STRICT_MILESTONES:
        fitting = [p for p in candidates if p.plot_type <= plot.plot_type]
        return fitting[0] if fitting else None

    # Habitat / Sanctuary: prefer a fit, fall back to anything at this milestone
    fitting = [p for p in candidates if p.plot_type <= plot.plot_type]
    pool = fitting if fitting else candidates
    return pool[0] if pool else None


def get_nesting_quests(db: Session, plot: Plot) -> Nesting | None:
    candidates = db.execute(select(Nesting).where(Nesting.milestone == plot.milestone)).scalars().all()

    if plot.milestone in STRICT_MILESTONES:
        fitting = [a for a in candidates if a.plot_type <= plot.plot_type]
        return fitting[0] if fitting else None

    fitting = [a for a in candidates if a.plot_type <= plot.plot_type]
    pool = fitting if fitting else candidates
    return pool[0] if pool else None
