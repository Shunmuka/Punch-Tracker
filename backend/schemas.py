from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Punch schemas
class PunchCreate(BaseModel):
    session_id: int
    punch_type: str
    speed: float
    count: int = 1
    notes: Optional[str] = None

class PunchResponse(BaseModel):
    id: int
    session_id: int
    punch_type: str
    speed: float
    count: int
    timestamp: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Session schemas
class SessionCreate(BaseModel):
    user_id: int
    name: str

class SessionResponse(BaseModel):
    id: int
    user_id: int
    name: str
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# User schemas
class UserCreate(BaseModel):
    username: str
    email: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics schemas
class SessionAnalytics(BaseModel):
    session_id: int
    total_punches: int
    average_speed: float
    punch_types: dict
    session_duration_minutes: Optional[float] = None
    ml_classification: Optional[str] = None  # TODO: Future ML integration
