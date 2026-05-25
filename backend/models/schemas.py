from pyclbr import Class

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HunterLog(BaseModel):
    log_date: datetime
    grind_tasks: bool = False
    grind_learning: bool = False
    vitality_workout: bool = False
    sense_thinking: bool = False
    sense_planning: bool = False
    shadow_time: bool = False
    journal: str = ""


    class Config:
        from_attributes = True

class HunterLogResponse(HunterLog):
    id: int 
    habits_checked: int
    cleared: bool
    xp_earned: int
