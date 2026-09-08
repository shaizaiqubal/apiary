"""Load a small, repeatable dataset for local development."""

from __future__ import annotations

import argparse
import json
import uuid
from pathlib import Path

from sqlalchemy import select

from backend.database import Base, SessionLocal, engine
from backend.models import Plot, Sighting, Species, User
from init_db import load_csv_to_db


DEMO_USER_ID = "11111111-1111-4111-8111-111111111111"
DEMO_PLOTS = (
    {
        "name": "Kitchen Garden",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "sun_shade": "sunny",
        "plot_type": 1,
        "area_sq_m": 6.0,
        "milestone": "seedling",
        "points": 0,
        "sightings": (1, 2),
    },
    {
        "name": "Community Meadow",
        "latitude": 51.4545,
        "longitude": -2.5879,
        "sun_shade": "partial shade",
        "plot_type": 2,
        "area_sq_m": 18.0,
        "milestone": "garden",
        "points": 500,
        "sightings": (3, 4),
    },
    {
        "name": "Wildlife Sanctuary",
        "latitude": 53.4808,
        "longitude": -2.2426,
        "sun_shade": "sunny",
        "plot_type": 3,
        "area_sq_m": 42.0,
        "milestone": "habitat",
        "points": 1250,
        "sightings": (5, 1),
    },
)


def load_demo_data(user_id: str = DEMO_USER_ID) -> None:
    """Create demo plots and sightings without duplicating them on reruns."""
    Base.metadata.create_all(bind=engine)
    load_csv_to_db()

    with SessionLocal() as db:
        user = db.get(User, user_id)
        if user is None:
            user = User(id=user_id)
            db.add(user)
            db.flush()

        for plot_data in DEMO_PLOTS:
            plot = db.execute(
                select(Plot).where(
                    Plot.user_id == user_id,
                    Plot.plot_name == plot_data["name"],
                )
            ).scalar_one_or_none()
            if plot is None:
                plot = Plot(
                    user_id=user_id,
                    plot_name=plot_data["name"],
                    latitude=plot_data["latitude"],
                    longitude=plot_data["longitude"],
                    sun_shade=plot_data["sun_shade"],
                    plot_type=plot_data["plot_type"],
                    area_sq_m=plot_data["area_sq_m"],
                    milestone=plot_data["milestone"],
                    points=plot_data["points"],
                )
                db.add(plot)
                db.flush()

            existing_sightings = {
                sighting.species_id
                for sighting in db.execute(
                    select(Sighting).where(Sighting.plot_id == plot.id)
                ).scalars()
            }
            for species_id in plot_data["sightings"]:
                if species_id in existing_sightings:
                    continue

                species = db.get(Species, species_id)
                if species is None:
                    raise RuntimeError(f"Species {species_id} is missing from the reference data")

                db.add(
                    Sighting(
                        id=str(uuid.uuid4()),
                        plot_id=plot.id,
                        species_id=species_id,
                        image_hash=f"demo-{plot.id}-{species_id}",
                        image_key="demo/bees/placeholder.jpg",
                        latitude=plot.latitude,
                        longitude=plot.longitude,
                        candidate_species_json=json.dumps(
                            [{"species_id": species_id, "confidence": 1.0}]
                        ),
                        verified_status="confirmed",
                        points_awarded=species.points,
                    )
                )

        db.commit()

    print(f"Loaded 3 demo plots and 6 bee sightings for user '{user_id}'.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--user-id", default=DEMO_USER_ID)
    args = parser.parse_args()
    load_demo_data(args.user_id)