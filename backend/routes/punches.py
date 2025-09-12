from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, get_redis
from models import Punch, Session
from schemas import PunchCreate, PunchResponse
import json

router = APIRouter()

@router.post("/punches", response_model=PunchResponse)
async def create_punch(punch: PunchCreate, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Create a new punch record"""
    
    # Verify session exists
    session = db.query(Session).filter(Session.id == punch.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Create punch record
    db_punch = Punch(
        session_id=punch.session_id,
        punch_type=punch.punch_type,
        speed=punch.speed,
        count=punch.count,
        notes=punch.notes
    )
    
    db.add(db_punch)
    db.commit()
    db.refresh(db_punch)
    
    # Update Redis cache with latest session stats (best-effort)
    try:
        await update_session_cache(punch.session_id, db, redis_client)
    except Exception:
        # If Redis is not available, ignore and continue
        pass
    
    return db_punch

@router.get("/punches/session/{session_id}", response_model=list[PunchResponse])
async def get_session_punches(session_id: int, db: Session = Depends(get_db)):
    """Get all punches for a specific session"""
    
    punches = db.query(Punch).filter(Punch.session_id == session_id).all()
    return punches

async def update_session_cache(session_id: int, db: Session, redis_client):
    """Update Redis cache with latest session statistics"""
    
    # Calculate session stats
    punches = db.query(Punch).filter(Punch.session_id == session_id).all()
    
    if punches:
        total_punches = sum(punch.count for punch in punches)
        avg_speed = sum(punch.speed * punch.count for punch in punches) / total_punches
        
        punch_types = {}
        for punch in punches:
            punch_types[punch.punch_type] = punch_types.get(punch.punch_type, 0) + punch.count
        
        session_stats = {
            "session_id": session_id,
            "total_punches": total_punches,
            "average_speed": round(avg_speed, 2),
            "punch_types": punch_types,
            "last_updated": punches[-1].timestamp.isoformat()
        }
        
        # Cache for 1 hour (best-effort)
        try:
            redis_client.setex(
                f"session_stats:{session_id}", 
                3600, 
                json.dumps(session_stats)
            )
        except Exception:
            # Redis unavailable; skip caching
            pass
