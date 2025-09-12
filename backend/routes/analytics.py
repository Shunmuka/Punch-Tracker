from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, get_redis
from models import Punch, Session
from schemas import SessionAnalytics
import json

router = APIRouter()

@router.get("/analytics/{session_id}", response_model=SessionAnalytics)
async def get_session_analytics(session_id: int, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Get analytics for a specific session"""
    
    # Check Redis cache first
    cached_stats = redis_client.get(f"session_stats:{session_id}")
    if cached_stats:
        stats = json.loads(cached_stats)
        return SessionAnalytics(
            session_id=session_id,
            total_punches=stats["total_punches"],
            average_speed=stats["average_speed"],
            punch_types=stats["punch_types"],
            ml_classification=await get_ml_classification(session_id)  # TODO: Future ML integration
        )
    
    # Verify session exists
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate analytics from database
    punches = db.query(Punch).filter(Punch.session_id == session_id).all()
    
    if not punches:
        return SessionAnalytics(
            session_id=session_id,
            total_punches=0,
            average_speed=0.0,
            punch_types={},
            ml_classification=await get_ml_classification(session_id)
        )
    
    # Calculate statistics
    total_punches = sum(punch.count for punch in punches)
    avg_speed = sum(punch.speed * punch.count for punch in punches) / total_punches
    
    punch_types = {}
    for punch in punches:
        punch_types[punch.punch_type] = punch_types.get(punch.punch_type, 0) + punch.count
    
    # Calculate session duration
    session_duration = None
    if session.ended_at:
        duration = session.ended_at - session.started_at
        session_duration = duration.total_seconds() / 60  # minutes
    
    return SessionAnalytics(
        session_id=session_id,
        total_punches=total_punches,
        average_speed=round(avg_speed, 2),
        punch_types=punch_types,
        session_duration_minutes=session_duration,
        ml_classification=await get_ml_classification(session_id)
    )

async def get_ml_classification(session_id: int) -> str:
    """
    TODO: Future ML integration for punch classification
    This is a placeholder that returns a hardcoded classification
    """
    # Placeholder ML classification logic
    classifications = ["Beginner", "Intermediate", "Advanced", "Professional"]
    return classifications[session_id % len(classifications)]
