from pydantic import BaseModel
from typing import List
from datetime import datetime

class SessionCreate(BaseModel):
    pass

class SessionResponse(BaseModel):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PunchCreate(BaseModel):
    speed_mps: float

class PunchResponse(BaseModel):
    id: int
    session_id: int
    speed_mps: float
    
    class Config:
        from_attributes = True

class SessionSummary(BaseModel):
    id: int
    created_at: datetime
    punch_count: int
    avg_speed: float

class PunchUpload(BaseModel):
    punches: List[PunchCreate]
