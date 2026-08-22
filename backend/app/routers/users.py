from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from backend.database import SessionLocal
from backend.models import User
from backend.app.dependencies import get_current_user_id
router = APIRouter(prefix='/users',tags=["users"])

def get_user_or_404(db, user_id: str) -> User:
    stmt = select(User).where(User.id == user_id)
    res = db.execute(stmt).scalar_one_or_none()
    if res is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Not Found"
        )
    return res

@router.post('/register',response_model=dict)
def register_user(id: str = Depends(get_current_user_id)) -> dict:
    with SessionLocal() as db:
        try:
            user = User(id=id)
            db.add(user)
            db.commit()
            db.refresh(user)
        except IntegrityError:
            db.rollback()
            user = db.execute(select(User).where(User.id == id)).scalar_one()
    return {"user_id": id, "join_date": user.join_date}

@router.get('/{id}', response_model=dict)
def get_user(id: str) -> dict:
    with SessionLocal() as db:
        stmt = select(User).where(User.id==id)
        res = db.execute(stmt).scalar_one_or_none()

    if res is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Not Found"
        )

    return {"user_id": res.id, "join_date": res.join_date}
