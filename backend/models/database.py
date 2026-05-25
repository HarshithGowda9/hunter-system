from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Date


# Define the HabitLog model for the database
class DailyHunterLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    log_date: datetime = Field(sa_column=Column(Date))
    grind_tasks: bool = False
    grind_learning: bool = False
    vitality_workout: bool = False
    sense_thinking: bool = False
    sense_planning: bool = False
    shadow_time: bool = False
    journal: str
    habits_checked: int
    cleared: bool
    xp_earned: int = 0

# Define the HunterStats model for the database
class HunterStats(SQLModel, table=True):
    id : Optional[int] = Field(default=None, primary_key=True)
    total_xp: int = 0
    streak: int = 0
    last_log_date: Optional[datetime] = None
    grind_xp: int = 0
    vitality_xp: int = 0
    sense_xp: int = 0
    shadow_xp: int = 0

class FitnessStats(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key = True) 
    log_date: datetime = Field(sa_column=Column(Date))
    day_number: int
    pct_completed: int = 0
    # Sections completed 
    warmup_done: bool = False
    strength_done: bool = False
    flexibility_done: bool = False
    breathing_done: bool = False


# SQLite engine - creates hunter.db in the current directory    
engine = create_engine("sqlite:///hunter.db", echo=True)

def create_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session