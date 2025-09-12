from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from models import UserRole

# Auth schemas
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.ATHLETE

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

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
    name: str

class SessionUpdate(BaseModel):
    name: Optional[str] = None
    ended_at: Optional[datetime] = None

class SessionResponse(BaseModel):
    id: int
    user_id: int
    name: str
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SessionList(BaseModel):
    sessions: List[SessionResponse]
    total: int
    limit: int
    offset: int

# Analytics schemas
class SessionAnalytics(BaseModel):
    session_id: int
    total_punches: int
    average_speed: float
    punch_types: dict
    session_duration_minutes: Optional[float] = None
    ml_classification: Optional[str] = None

class WeeklyAnalytics(BaseModel):
    this_week: dict
    last_week: dict
    delta_percent: float
    sparkline_data: List[dict]
    fatigue_proxy: Optional[float] = None

# Notification schemas
class NotificationPrefsUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    webhook_enabled: Optional[bool] = None
    webhook_url: Optional[str] = None

class NotificationPrefsResponse(BaseModel):
    id: int
    user_id: int
    email_enabled: bool
    webhook_enabled: bool
    webhook_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Coach schemas
class CoachInvite(BaseModel):
    athlete_email: EmailStr

class CoachInviteResponse(BaseModel):
    invite_code: str

class CoachAcceptInvite(BaseModel):
    invite_code: str

class AthleteSummary(BaseModel):
    id: int
    username: str
    email: str
    total_punches: int
    average_speed: float
    sessions_count: int
    last_session_date: Optional[datetime] = None

class CoachAthletesResponse(BaseModel):
    athletes: List[AthleteSummary]
