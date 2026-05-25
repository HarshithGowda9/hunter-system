from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import Optional
from backend.models.database import DailyHunterLog, HunterStats, get_session

router = APIRouter(prefix="/logs", tags=["Daily Logs"])

XP_PER_HABIT = 7
XP_CLEAR_BONUS = 50
CLEAR_THRESHOLD = 4

def calculate_xp(log: DailyHunterLog):
    habits = [
        log.grind_tasks,
        log.grind_learning,
        log.vitality_workout,
        log.sense_thinking,
        log.sense_planning,
        log.shadow_time
        ]
    
    log.habits_checked = sum(habits)
    log.cleared = log.habits_checked >= CLEAR_THRESHOLD
    log.xp_earned = (log.habits_checked * XP_PER_HABIT) + (XP_CLEAR_BONUS if log.cleared else 0 )
    return log

@router.post("/", response_model=DailyHunterLog)
def create_log(log: DailyHunterLog, session: Session = Depends(get_session)):
    # Check if a log already exists for the given date
    existing = session.exec(select(DailyHunterLog).where(DailyHunterLog.log_date == log.log_date)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Log for this date already exists")
    # Convert string to date object if needed
    if isinstance(log.log_date, str):
        log.log_date = datetime.strptime(log.log_date, "%Y-%m-%d").date()
    # Calculate XP and clear status
    log = calculate_xp(log)

    # Update HunterStats
    stats = session.exec(select(HunterStats)).first()
    if not stats:
        stats = HunterStats()
        session.add(stats)
    
    stats.total_xp += log.xp_earned
    stats.grind_xp += (log.grind_tasks + log.grind_learning) * XP_PER_HABIT
    stats.vitality_xp += log.vitality_workout * XP_PER_HABIT
    stats.sense_xp += (log.sense_thinking + log.sense_planning) * XP_PER_HABIT
    stats.shadow_xp += log.shadow_time * XP_PER_HABIT


    # Update streak
    yesterday = log.log_date - timedelta(days=1)
    stats.streak = stats.streak +1 if stats.last_log_date == yesterday else 1
    stats.last_log_date = log.log_date 

    session.add(log)
    session.commit()    
    session.refresh(log)
    return log

# Get all logs
@router.get("/", response_model=list[DailyHunterLog])
def get_logs(session: Session = Depends(get_session)):
    return session.exec(select(DailyHunterLog).order_by(DailyHunterLog.log_date.desc())).all()



# Get today's log
@router.get("/today", response_model=Optional[DailyHunterLog])
def get_today(session: Session = Depends(get_session)):
    return session.exec(select(DailyHunterLog).where(DailyHunterLog.log_date == datetime.today().date())).first()