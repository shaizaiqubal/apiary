import csv
from backend.database import SessionLocal
from backend.models import (
    Nesting,
    Plant,
    Shiny,
    Species
)
def load_csv_to_db(filepath):
    with open(filepath, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            # Convert empty strings to None (NULL in PostgreSQL) for our nullable column
            #species_id = row['attracts_species_id'] if row['attracts_species_id'] else None
            
            # Create a new record instance
            action_record = Shiny(
                species_id=row["species_id"],
                plant_id=row["plant_id"]
                )
            with SessionLocal() as db:
            # Add to the session (merging handles potential ID conflicts if you run it twice)
                db.merge(action_record) 
                db.commit()
            print(f'{row["species_id"]} inserted')

            
        
        print("Data successfully inserted into PostgreSQL!")

if __name__=='__main__':
    load_csv_to_db('data/shiny.csv')
