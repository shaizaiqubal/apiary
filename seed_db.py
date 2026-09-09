"""
seed_data.py

Creates demo data for Apiary so the app has something to show on first load:
- one "hero" user (UUID you provide, or a fresh one) with 4 plots, one at
  each milestone tier, each carrying a random mix of plant/nesting quests
- 7 confirmed bee species in that user's Bee-dex, weighted toward common
  species (a "natural" rarity distribution)
- 5 extra plots owned by fresh random users, scattered across the UK, just
  so the community map isn't empty

ASSUMPTIONS - check these against your real conventions and adjust if wrong:
  - plants / nestings / species / plot_milestones are already loaded from
    the real CSVs (via csv_loader.py or similar). This script only reads
    them; it never invents plant, action, or species rows.
  - sun_shade values are one of: "full_sun", "partial_shade", "full_shade"
  - plot_type is a small int code (1-3) — there's no enum in models.py yet,
    so this is a placeholder. Swap PLOT_TYPES below for your real codes.
  - If plot_milestones is empty, falls back to Seedling/Garden/Habitat/
    Sanctuary at 0/500/1250/2500 cumulative points.

Run from your project root, e.g.:
    python -m backend.seed_data
(adjust the import paths below if seed_data.py doesn't live next to
csv_loader.py / models.py / database.py)
"""

import random
import uuid
from datetime import date, timedelta

from backend.database import SessionLocal
from backend.models import User, Plot, Quest, Sighting, Plant, Nesting, Species, PlotMilestone

# ---------------------------------------------------------------------------
# Config / assumptions you may need to tweak
# ---------------------------------------------------------------------------

SUN_SHADE_OPTIONS = ["full_sun", "partial_shade", "full_shade"]
PLOT_TYPES = [1, 2, 3, 4]  # placeholder — adjust to match your real plot_type codes

FALLBACK_MILESTONES = [
    ("seedling", 0),
    ("garden", 500),
    ("habitat", 1250),
    ("sanctuary", 2500),
]

# UK anchor for the hero user's 4 plots (mid-Bristol) — small jitter keeps
# them visibly close together on the map without stacking exactly.
HERO_BASE_LAT = 51.4545
HERO_BASE_LNG = -2.5879
HERO_JITTER = 0.01  # roughly a 1-2km spread

# Rough bounding box for scattering the filler plots across mainland UK
UK_LAT_RANGE = (50.0, 58.5)
UK_LNG_RANGE = (-6.5, 1.5)

# Bias for the 7-species Bee-dex pull: common bees show up far more than
# specialists, matching how you'd actually expect sightings to land.
RARITY_WEIGHTS = {
    "Common": 50,
    "Uncommon": 30,
    "Rare": 15,
    "Shiny": 5,
}

FILLER_PLOT_COUNT = 5


def jitter(base, spread):
    return base + random.uniform(-spread, spread)


def random_uk_coords():
    return random.uniform(*UK_LAT_RANGE), random.uniform(*UK_LNG_RANGE)


def get_milestones(db):
    rows = db.query(PlotMilestone).order_by(PlotMilestone.points_required).all()
    if rows:
        return [(r.milestone, r.points_required) for r in rows]
    print("plot_milestones table is empty — falling back to hardcoded tiers.")
    return FALLBACK_MILESTONES


def points_for_tier(tier_index, milestones):
    """A plausible points total for a plot sitting at this milestone tier."""
    _, floor = milestones[tier_index]
    ceiling = milestones[tier_index + 1][1] if tier_index + 1 < len(milestones) else floor + 1000
    return random.randint(floor, max(floor, ceiling - 25))


def pick_weighted_distinct_species(all_species, count):
    """Weighted sample without replacement, biased toward common bees."""
    pool = list(all_species)
    weights = [RARITY_WEIGHTS.get(s.rarity_tier, 10) for s in pool]
    chosen = []
    for _ in range(min(count, len(pool))):
        pick = random.choices(pool, weights=weights, k=1)[0]
        idx = pool.index(pick)
        chosen.append(pool.pop(idx))
        weights.pop(idx)
    return chosen


def make_quest(plot, plants, actions, milestone_name):
    """One random Quest — plant OR nesting action, matched to the plot's milestone when possible."""
    use_plant = random.random() < 0.5

    if use_plant and plants:
        candidates = [p for p in plants if p.milestone == milestone_name] or plants
        plant = random.choice(candidates)
        return Quest(
            plot_id=plot.id,
            plant_id=plant.plant_id,
            action_id=None,
            date_completed=date.today() - timedelta(days=random.randint(0, 60)),
            photo_url=f"https://placehold.co/400x300?text={plant.common_name.replace(' ', '+')}",
            verified_status="confirmed",
            points_awarded=plant.points,
        )

    if actions:
        candidates = [a for a in actions if a.milestone == milestone_name] or actions
        action = random.choice(candidates)
        return Quest(
            plot_id=plot.id,
            plant_id=None,
            action_id=action.action_id,
            date_completed=date.today() - timedelta(days=random.randint(0, 60)),
            photo_url=f"https://placehold.co/400x300?text={action.action.replace(' ', '+')}",
            verified_status="confirmed",
            points_awarded=action.points,
        )

    return None


def make_sighting(plot, species):
    return Sighting(
        id=str(uuid.uuid4()),
        plot_id=plot.id,
        species_id=species.species_id,
        image_hash=uuid.uuid4().hex,
        image_key=f"seed/{uuid.uuid4().hex}.jpg",
        latitude=plot.latitude,
        longitude=plot.longitude,
        candidate_species_json=None,
        verified_status="confirmed",
        points_awarded=species.points,
    )


def main():
    raw = input("UUID for the primary demo user (blank = generate a new one): ").strip()
    hero_uuid = raw if raw else str(uuid.uuid4())

    with SessionLocal() as db:
        plants = db.query(Plant).all()
        actions = db.query(Nesting).all()
        species = db.query(Species).all()
        milestones = get_milestones(db)

        if not plants or not actions or not species:
            print("plants / nestings / species tables look empty.")
            print("Load the real CSVs first (see csv_loader.py) — this script only seeds users, plots, quests and sightings on top of that reference data.")
            return

        # --- hero user -------------------------------------------------
        hero = db.get(User, hero_uuid)
        if hero is None:
            hero = User(id=hero_uuid)
            db.add(hero)
            db.commit()
            print(f"Created user {hero_uuid}")
        else:
            print(f"User {hero_uuid} already exists — adding plots to it")

        hero_plots = []
        for i, (milestone_name, _) in enumerate(milestones[:4]):
            plot = Plot(
                user_id=hero.id,
                plot_name=f"{milestone_name.title()} Plot",
                latitude=jitter(HERO_BASE_LAT, HERO_JITTER),
                longitude=jitter(HERO_BASE_LNG, HERO_JITTER),
                sun_shade=random.choice(SUN_SHADE_OPTIONS),
                plot_type=random.choice(PLOT_TYPES),
                area_sq_m=round(random.uniform(2, 40), 1),
                milestone=milestone_name,
                points=points_for_tier(i, milestones),
            )
            db.add(plot)
            db.flush()  # assign plot.id without a full commit
            hero_plots.append(plot)

            for _ in range(random.randint(2, 5)):
                quest = make_quest(plot, plants, actions, milestone_name)
                if quest:
                    db.add(quest)

        db.commit()
        print(f"Created 4 plots for {hero_uuid}: {[p.milestone for p in hero_plots]}")

        # --- bee-dex: 7 confirmed species, naturally distributed -------
        chosen_species = pick_weighted_distinct_species(species, 7)
        for sp in chosen_species:
            plot = random.choice(hero_plots)
            db.add(make_sighting(plot, sp))
        db.commit()
        print(f"Logged {len(chosen_species)} confirmed sightings: "
              f"{[s.common_name for s in chosen_species]}")

        # --- filler plots so the map isn't empty ------------------------
        for _ in range(FILLER_PLOT_COUNT):
            filler_uuid = str(uuid.uuid4())
            filler_user = User(id=filler_uuid)
            db.add(filler_user)
            db.flush()

            lat, lng = random_uk_coords()
            milestone_name, _ = random.choice(milestones)
            filler_plot = Plot(
                user_id=filler_user.id,
                plot_name="Wild Plot",
                latitude=lat,
                longitude=lng,
                sun_shade=random.choice(SUN_SHADE_OPTIONS),
                plot_type=random.choice(PLOT_TYPES),
                area_sq_m=round(random.uniform(2, 40), 1),
                milestone=milestone_name,
                points=random.randint(0, 3000),
            )
            db.add(filler_plot)

        db.commit()
        print(f"Added {FILLER_PLOT_COUNT} filler plots scattered across the UK.")

    print("Done.")


if __name__ == "__main__":
    main()