from backend.database import Base, engine, SessionLocal
from backend.models import (
    Nesting,
    Plant,
    Shiny,
    Species,
)
import csv
import logging

logging.basicConfig(level=logging.INFO)

Base.metadata.create_all(bind=engine)
logging.info(">> Database schema initialized <<")


def load_shiny():
    with open("data/shiny.csv", mode="r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            shiny_record = Shiny(
                species_id=int(row["species_id"]),
                plant_id=int(row["plant_id"]),
            )
            with SessionLocal() as db:
                db.merge(shiny_record)
                db.commit()
            logging.info("%s-%s inserted", row["species_id"], row["plant_id"])


def load_nesting():
    with open("data/nesting.csv", mode="r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            nesting_record = Nesting(
                action_id=int(row["action_id"]),
                action=row["action"],
                plot_type=int(row["plot_type"]),
                milestone=row["milestone"],
                points=int(row["points"]),
                notes=row["notes"],
                steps=row["steps"],
                url=row["url"],
            )
            with SessionLocal() as db:
                db.merge(nesting_record)
                db.commit()
            logging.info("%s inserted", row["action_id"])


def load_plant():
    with open("data/plants.csv", mode="r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            plant_record = Plant(
                plant_id=int(row["plant_id"]),
                common_name=row["common_name"],
                plant_name=row["plant_name"],
                native_status=row["native_status"],
                sun_shade=row["sun_shade"],
                plot_type=int(row["plot_type"]),
                area_reqd=float(row["area_reqd_(metres)"]),
                bloom_season=row["bloom_season"],
                milestone=row["milestone"],
                hardiness=row["hardiness"],
                points=int(row["points"]),
                notes=row["notes"],
                rhs_link=row["rhs_link"],
            )
            with SessionLocal() as db:
                db.merge(plant_record)
                db.commit()
            logging.info("%s inserted", row["plant_id"])


def load_species():
    with open("data/species.csv", mode="r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            species_record = Species(
                species_id=int(row["species_id"]),
                common_name=row["common_name"],
                scientific_name=row["scientific_name"],
                rarity_tier=row["rarity_tier"],
                points=int(row["points"]),
                fun_facts=row["fun_facts"],
            )
            with SessionLocal() as db:
                db.merge(species_record)
                db.commit()
            logging.info("%s inserted", row["species_id"])


def load_csv_to_db():
    load_species()
    load_plant()
    load_nesting()
    load_shiny()

    logging.info("Data successfully inserted into PostgreSQL!")


if __name__ == "__main__":
    load_csv_to_db()
