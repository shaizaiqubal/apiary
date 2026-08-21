from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database import Base,engine
from backend.app.routers import beedex, quests, sightings, users, plot

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Apiary API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users.router)
app.include_router(plot.router)
app.include_router(beedex.router)
app.include_router(quests.router)
app.include_router(sightings.router)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Apiary API"}

