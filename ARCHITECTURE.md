# Apiary Architecture

## Overview

Apiary is a React/FastAPI game for recording pollinator-friendly gardening actions and bee sightings. Users create plots, complete verified quests, record bee sightings, earn points, and progress through four plot milestones.

```text
Browser (Vercel)
  │ Axios / REST
  ▼
React + Vite 
  │ X-User-ID header
  ▼
FastAPI (Google Cloud Run)
  ├── PostgreSQL (Render) via SQLAlchemy
  ├── Gemini image verification
  └── Google Cloud Storage for sighting images
```

## Repository structure

```text
backend/
  app/main.py                  API setup, CORS, exception handlers
  app/routers/                 Users, plots, Bee-dex, quests, sightings
  app/services/                Verification, storage, quest and region logic
  database.py                  SQLAlchemy engine and sessions
  models.py                    ORM models
  schemas.py                   Pydantic response schemas
data/                          CSV source data
frontend/src/pages/            Route-level screens and styles
frontend/src/components/       Reusable UI components
frontend/src/api.js            Axios API wrapper
frontend/public/               Bee images, cursor and audio assets
init_db.py                     Database and CSV bootstrap
seed_db.py                     Demo data
docker-compose.yaml            Local development stack
```

## Frontend

The Vite React application routes to the home screen, plot carousel, new plot form, plot detail, Bee-dex, and field map
`api.js` uses one Axios client. A request interceptor reads `apiary_uuid` from `localStorage` and sends it as `X-User-ID`. 

### Main flows

- **Plot carousel:** Loads the current user's plots and always includes a new-plot slide, including for users with no plots. It links to the Bee-dex and shared map.
- **Plot creation:** Collects name, coordinates, sunlight, habitat type, and optional area, then posts to `/plots/create`.
- **Plot detail:** Displays points, milestone progress, activity, quests, and sightings.
- **Quest submission:** Uploads a photo, shows processing state, and displays an accepted or rejected notice. Rejected submissions are not persisted.
- **Bee-dex:** Displays all species or discovered species only, supports serial/rarity sorting, and loads local images from `public/bees` using species IDs.
- **Sightings:** Uploads a bee photo, displays candidate species as radio buttons, and confirms one candidate.

`LoadingState` supplies the shared route loading treatment. CSS is colocated with pages/components, and `audio.js` provides shared click audio behavior.

## Backend

`backend/app/main.py` creates the FastAPI app, creates missing tables at startup, configures local CORS, registers exception handlers, and mounts all routers.

### Routes

| Router | Responsibilities |
| --- | --- |
| `/users` | Create or retrieve the UUID-based user record |
| `/plots` | Create and retrieve owned plots; expose shared map data |
| `/beedex` | Return all species, discovered species, and species details |
| `/quests` | Select quests and verify quest photos |
| `/sightings` | Process, store, and confirm bee sightings |

User-owned plot operations validate both the plot ID and current user ID. The shared map intentionally exposes public plot location/progression data.

## Database model

```text
User 1 ─── * Plot
Plot 1 ─── * Quest
Plot 1 ─── * Sighting
Plant 1 ─── * Quest
Nesting 1 ─── * Quest
Species 1 ─── * Sighting
Plant * ─── * Species through Shiny
PlotMilestone stores progression thresholds
```

### Important tables

- **users:** UUID identity and join date.
- **plots:** Owner, name, coordinates, sunlight, habitat type, optional area, milestone, and points. Plot IDs are strings formed as `{user_id}{plot_number}`.
- **plants:** Plant recommendations loaded from `data/plants.csv`, including sunlight, hardiness, habitat type, milestone, points, and RHS link.
- **nestings:** Habitat actions loaded from `data/nesting.csv`.
- **species:** Bee names, rarity tiers, points, and facts loaded from `data/species.csv`.
- **quests:** Accepted verified plant/nesting actions. Exactly one of `plant_id` or `action_id` should be set.
- **sightings:** Image hash/key, coordinates, candidate JSON, status, species, and awarded points.
- **shiny:** Plant/species relationship table.
- **plot_milestones:** Cumulative point thresholds for Seedling, Garden, Habitat, and Sanctuary.

## Quest and progression logic

Quest selection filters by milestone, region/hardiness, sunlight, habitat type, and previously verified quests. Early milestones enforce habitat fit; later milestones can fall back to available candidates.

For a quest submission, the backend validates the image and asks Gemini whether it matches the expected action. A rejected result returns reasoning and creates no database row. A verified result creates the quest, adds its configured points to the plot, and updates the milestone.

Plot milestones are cumulative. The highest configured threshold not exceeding the plot's points becomes the current milestone.

## Bee sighting flow

1. Validate image type and size.
2. Calculate an image SHA-256 hash.
3. Run vision identification against the allowed species list.
4. Store a pending sighting only after successful processing.
5. Let the user confirm one returned candidate.
6. Award full species points for a first confirmed sighting and repeat points for later sightings.

Sighting confirmation validates both ownership and that the selected species was one of the stored candidates. Accepted image objects use Google Cloud Storage when configured.

## Data and deployment

`init_db.py` loads the CSV files and milestone data. `seed_db.py` creates demo users, nearby plots, quests, and sightings.

Docker Compose runs:

- PostgreSQL with a persistent volume;
- an initialization container;
- FastAPI on port 8000;
- Vite frontend on port 5173.

Environment variables provide the database URL, Gemini key, Google Cloud settings, and frontend API configuration.

