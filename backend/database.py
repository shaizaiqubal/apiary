from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, DeclarativeBase

engine = create_engine(
    url='postgresql+psycopg://shaiza@localhost:5432/bee',
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

#Base.metadata.create_all(bind=engine)

