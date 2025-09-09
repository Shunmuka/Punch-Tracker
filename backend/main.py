from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, create_tables, Session as DBSession, Punch
from models import SessionCreate, SessionResponse, PunchUpload, PunchResponse, SessionSummary
from typing import List
import random
from datetime import datetime

app = FastAPI(title="PunchTracker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
create_tables()

@app.get("/")
async def root():
    return {"message": "PunchTracker API"}

@app.post("/sessions", response_model=SessionResponse)
async def create_session(db: Session = Depends(get_db)):
    db_session = DBSession(created_at=datetime.utcnow())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.post("/sessions/{session_id}/punches", response_model=List[PunchResponse])
async def upload_punches(session_id: int, punch_data: PunchUpload, db: Session = Depends(get_db)):
    # Check if session exists
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Create punches
    punches = []
    for punch in punch_data.punches:
        db_punch = Punch(session_id=session_id, speed_mps=punch.speed_mps)
        db.add(db_punch)
        punches.append(db_punch)
    
    db.commit()
    
    # Refresh to get IDs
    for punch in punches:
        db.refresh(punch)
    
    return punches

@app.get("/sessions/{session_id}/summary", response_model=SessionSummary)
async def get_session_summary(session_id: int, db: Session = Depends(get_db)):
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    punches = db.query(Punch).filter(Punch.session_id == session_id).all()
    
    punch_count = len(punches)
    avg_speed = sum(p.speed_mps for p in punches) / punch_count if punch_count > 0 else 0
    
    return SessionSummary(
        id=session.id,
        created_at=session.created_at,
        punch_count=punch_count,
        avg_speed=round(avg_speed, 2)
    )

@app.get("/sessions", response_model=List[SessionSummary])
async def get_all_sessions(db: Session = Depends(get_db)):
    sessions = db.query(DBSession).all()
    summaries = []
    
    for session in sessions:
        punches = db.query(Punch).filter(Punch.session_id == session.id).all()
        punch_count = len(punches)
        avg_speed = sum(p.speed_mps for p in punches) / punch_count if punch_count > 0 else 0
        
        summaries.append(SessionSummary(
            id=session.id,
            created_at=session.created_at,
            punch_count=punch_count,
            avg_speed=round(avg_speed, 2)
        ))
    
    return summaries

@app.post("/seed")
async def seed_data(db: Session = Depends(get_db)):
    """Seed the database with sample data"""
    # Create a sample session
    session = DBSession(created_at=datetime.utcnow())
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Add 50 random punches
    punches = []
    for _ in range(50):
        speed = round(random.uniform(5.0, 15.0), 2)  # Random speed between 5-15 m/s
        punch = Punch(session_id=session.id, speed_mps=speed)
        db.add(punch)
        punches.append(punch)
    
    db.commit()
    
    return {"message": f"Created session {session.id} with {len(punches)} punches"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
