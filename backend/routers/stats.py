from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models.database import HunterStats, get_session


router = APIRouter(prefix="/stats", tags=["Hunter Stats"])

@router.get("/", response_model=HunterStats)
def get_stats(session: Session = Depends(get_session)):
    stats = session.exec(select(HunterStats)).first()
    if not stats:
        stats = HunterStats()
        session.add(stats)
        session.commit()
        session.refresh(stats)
    return stats

