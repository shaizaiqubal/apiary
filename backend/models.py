import uuid
import datetime
from datetime import date
from sqlalchemy import (
    String, Integer, Float, Date, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from backend.database import Base

class Plant(Base):
    __tablename__= "plants"

    plant_id: Mapped[int] = mapped_column(primary_key=True)
    common_name: Mapped[str] = mapped_column()
    plant_name: Mapped[str] = mapped_column()
    native_status: Mapped[str] = mapped_column()
    sun_shade: Mapped[str] = mapped_column()
    plot_type: Mapped[int] = mapped_column()
    area_reqd: Mapped[float] = mapped_column()
    bloom_season: Mapped[str] = mapped_column()
    milestone: Mapped[str] = mapped_column()
    hardiness: Mapped[str] = mapped_column()
    points: Mapped[int] = mapped_column()
    notes: Mapped[str] = mapped_column(Text)
    rhs_link: Mapped[str] = mapped_column()

    quests: Mapped[list["Quest"]] = relationship("Quest", back_populates="plant")
    shiny_links: Mapped[list["Shiny"]] = relationship("Shiny", back_populates="plant")


class Nesting(Base):
    __tablename__ = "nestings"

    action_id: Mapped[int] = mapped_column(primary_key=True)
    action: Mapped[str] = mapped_column()
    plot_type: Mapped[int] = mapped_column()
    milestone: Mapped[str] = mapped_column()
    points: Mapped[int] = mapped_column()
    notes: Mapped[str] = mapped_column(Text)
    steps: Mapped[str] = mapped_column(Text)
    url: Mapped[str] = mapped_column()

    quests: Mapped[list["Quest"]] = relationship("Quest", back_populates="nesting_action")

class Species(Base):
    __tablename__ = "species"

    species_id: Mapped[int] = mapped_column(primary_key=True)
    common_name: Mapped[str] = mapped_column()
    scientific_name: Mapped[str] = mapped_column()
    rarity_tier: Mapped[str] = mapped_column()
    points: Mapped[int] = mapped_column()
    fun_facts: Mapped[str] = mapped_column(Text)

    sightings: Mapped[list["Sighting"]] = relationship("Sighting", back_populates="species")
    shiny_links: Mapped[list["Shiny"]] = relationship("Shiny", back_populates="species")


class Shiny(Base):
    __tablename__ = "shiny"

    species_id: Mapped[int] = mapped_column(
        ForeignKey("species.species_id"),
        primary_key=True,
    )
    plant_id: Mapped[int] = mapped_column(
        ForeignKey("plants.plant_id"),
        primary_key=True,
    )

    species: Mapped["Species | None"] = relationship("Species", back_populates="shiny_links")
    plant: Mapped["Plant | None"] = relationship("Plant", back_populates="shiny_links")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    join_date: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    plots: Mapped[list["Plot"]] = relationship("Plot", back_populates="user")


class Plot(Base):
    __tablename__ = "plots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    plot_name: Mapped[str] = mapped_column(String)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    sun_shade: Mapped[str] = mapped_column(String, nullable=False)
    plot_type: Mapped[int] = mapped_column(Integer, nullable=False)
    area_sq_m: Mapped[float | None] = mapped_column(Float, nullable=True)

    milestone: Mapped[str] = mapped_column(String, default="Seedling")
    points: Mapped[int] = mapped_column(Integer, default=0)
    created: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User | None"] = relationship("User", back_populates="plots")
    quests: Mapped[list["Quest"]] = relationship("Quest", back_populates="plot")
    sightings: Mapped[list["Sighting"]] = relationship("Sighting", back_populates="plot")


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plot_id: Mapped[int] = mapped_column(Integer, ForeignKey("plots.id"), nullable=False)

    # Exactly one of these should be set
    plant_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("plants.plant_id"), nullable=True)
    action_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("nestings.action_id"), nullable=True)

    date_completed: Mapped[date] = mapped_column(Date, default=date.today)
    photo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    verified_status: Mapped[str] = mapped_column(String, default="pending")
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)

    plot: Mapped["Plot"] = relationship("Plot", back_populates="quests")
    plant: Mapped["Plant | None"] = relationship("Plant", back_populates="quests")
    nesting_action: Mapped["Nesting | None"] = relationship("Nesting", back_populates="quests")


class Sighting(Base):
    __tablename__ = "sightings"

    id: Mapped[str] = mapped_column(String, primary_key=True,)
    plot_id: Mapped[int] = mapped_column(Integer, ForeignKey("plots.id"), nullable=False)
    species_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("species.species_id"), nullable=True)

    image_hash: Mapped[str] = mapped_column(String)
    image_key: Mapped[str] = mapped_column(String)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # LLM vision candidates before user confirms, e.g. '[{"species_id":22,"confidence":0.71}, ...]'
    candidate_species_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    verified_status: Mapped[str] = mapped_column(String, default="pending")  # pending | confirmed | rejected
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)

    plot: Mapped["Plot"] = relationship("Plot", back_populates="sightings")
    species: Mapped["Species | None"] = relationship("Species", back_populates="sightings")

class PlotMilestone(Base):
    __tablename__ = "plot_milestones"
    
    milestone_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    milestone: Mapped[str] = mapped_column(String, unique=True)
    points_required: Mapped[int] = mapped_column(Integer, nullable=False)
