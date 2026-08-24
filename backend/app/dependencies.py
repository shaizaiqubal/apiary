from uuid import UUID
from sqlalchemy import func, select
from fastapi import Header, HTTPException, status
from backend.models import Plot, PlotMilestone
import hashlib

def get_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()

def get_current_user_id(x_user_id: str | None = Header(default=None, alias="X-User-ID")) -> str:
    """
    Temporary identity abstraction for Stage 1.

    This is not authentication. It only extracts the current user's UUID from
    the X-User-ID header until real auth is implemented.
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-ID header",
        )

    try:
        return str(UUID(x_user_id))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-User-ID header",
        ) from exc



    

def update_milestone(plot_id: int, user_id: str, db) -> bool:

    plot = db.execute(
        select(Plot).where(Plot.id == plot_id, Plot.user_id == user_id)
    ).scalar_one_or_none()

    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    cur_points = plot.points

    current_milestone = db.execute(
        select(PlotMilestone).where(
            func.lower(PlotMilestone.milestone) == func.lower(plot.milestone)
        )
    ).scalar_one_or_none()

    if not current_milestone:
        raise HTTPException(status_code=404, detail="Current plot milestone not found")

    if plot.milestone != current_milestone.milestone:
        plot.milestone = current_milestone.milestone

    next_milestone = db.execute(
        select(PlotMilestone).where(
            PlotMilestone.milestone_id == current_milestone.milestone_id + 1
        )
    ).scalar_one_or_none()

    if not next_milestone:
        return False  # No further milestones
    
    if cur_points >= next_milestone.points_required:
        plot.milestone = next_milestone.milestone
        db.commit()
        db.refresh(plot)

        return True  # Milestone updated

    return False  # No update needed
