from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class UserRole(str, enum.Enum):
    ATHLETE = "athlete"
    COACH = "coach"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.ATHLETE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sessions = relationship("Session", back_populates="user")
    notification_prefs = relationship("NotificationPrefs", back_populates="user", uselist=False)
    coach_relationships = relationship("CoachAthlete", foreign_keys="CoachAthlete.coach_id", back_populates="coach")
    athlete_relationships = relationship("CoachAthlete", foreign_keys="CoachAthlete.athlete_id", back_populates="athlete")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    punches = relationship("Punch", back_populates="session")

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    auto_detected = Column(Boolean, default=False)

    # Relationships
    user = relationship("User")
    segments = relationship("WorkoutSegment", back_populates="workout", cascade="all, delete-orphan")
    punches = relationship("Punch", back_populates="workout")

class WorkoutSegment(Base):
    __tablename__ = "workout_segments"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    kind = Column(String(20), nullable=False)  # active | rest
    started_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=False)
    target_seconds = Column(Integer, nullable=True)

    # Relationships
    workout = relationship("Workout", back_populates="segments")

class Punch(Base):
    __tablename__ = "punches"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=True)
    segment_id = Column(Integer, ForeignKey("workout_segments.id"), nullable=True)
    punch_type = Column(String(20), nullable=False)  # jab, cross, hook, uppercut
    speed = Column(Float, nullable=False)  # mph or m/s
    count = Column(Integer, default=1)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)
    
    # Relationships
    session = relationship("Session", back_populates="punches")
    workout = relationship("Workout", back_populates="punches")

class NotificationPrefs(Base):
    __tablename__ = "notification_prefs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    email_enabled = Column(Boolean, default=True)
    webhook_enabled = Column(Boolean, default=False)
    webhook_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notification_prefs")

class CoachAthlete(Base):
    __tablename__ = "coach_athlete"
    
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    coach = relationship("User", foreign_keys=[coach_id], back_populates="coach_relationships")
    athlete = relationship("User", foreign_keys=[athlete_id], back_populates="athlete_relationships")
    
    # Ensure unique coach-athlete relationship
    __table_args__ = (
        {"extend_existing": True}
    )
