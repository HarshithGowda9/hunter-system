from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy import desc
from datetime import datetime
from backend.models.database import FitnessStats, get_session

router = APIRouter(prefix='/fitness', tags=["Fitness"])

@router.post("/", response_model=FitnessStats)
def log_fitness(log: FitnessStats, session: Session = Depends(get_session)):
    # Check if a log for the given date already exists
    if isinstance(log.log_date, str):
        log.log_date = datetime.strptime(log.log_date, "%Y-%m-%d")
    existing_log = session.exec(select(FitnessStats).where(FitnessStats.log_date == log.log_date)).first()
    if existing_log:
        raise HTTPException(status_code=400, detail="Log for this date already exists")
    session.add(log)
    session.commit()
    session.refresh(log)
    return log

@router.get("/", response_model=list[FitnessStats])
def get_fitness_logs(session: Session = Depends(get_session)):
    return session.exec(select(FitnessStats).order_by(FitnessStats.log_date.desc())).all()

@router.get("/today", response_model=FitnessStats | None)
def get_today_log(session: Session = Depends(get_session)):
    today = datetime.now().date()
    return session.exec(select(FitnessStats).where(FitnessStats.log_date == today)).first()