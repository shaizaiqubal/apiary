from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging
import os

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")

logger = logging.getLogger(__name__)


from backend.database import Base,engine
from backend.app.routers import beedex, quests, sightings, users, plot
from backend.app.errors import ServiceError


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Apiary API", lifespan=lifespan)

@app.exception_handler(ServiceError)
async def service_error_handler(request: Request, exc: ServiceError) -> JSONResponse:
    logger.error("Service failure on %s %s: %s", request.method, request.url.path, exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.code, "detail": exc.detail},
    )

@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "Unhandled API error on %s %s",
        request.method,
        request.url.path,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "detail": "An unexpected server error occurred",
        },
    )

origins = ["http://localhost:5173"]
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

