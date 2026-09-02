from uuid import UUID
from sqlalchemy import select
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

    milestones = db.execute(
        select(PlotMilestone).order_by(PlotMilestone.points_required.desc())
    ).scalars().all()

    if not milestones:
        raise HTTPException(status_code=404, detail="Current plot milestone not found")

    current_milestone = next(
        milestone for milestone in milestones
        if plot.points >= milestone.points_required
    )
    milestone_changed = plot.milestone.lower() != current_milestone.milestone.lower()
    plot.milestone = current_milestone.milestone

    if milestone_changed:
        db.commit()
        db.refresh(plot)

    return milestone_changed
