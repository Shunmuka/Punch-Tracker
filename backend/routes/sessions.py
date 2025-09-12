from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import Session as SessionModel, User
from schemas import SessionCreate, SessionUpdate, SessionResponse, SessionList
from auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/sessions", response_model=SessionList)
async def get_sessions(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's training sessions with pagination"""
    
    # Get total count
    total = db.query(SessionModel).filter(SessionModel.user_id == current_user.id).count()
    
    # Get sessions with pagination
    sessions = db.query(SessionModel).filter(
        SessionModel.user_id == current_user.id
    ).order_by(desc(SessionModel.started_at)).offset(offset).limit(limit).all()
    
    return SessionList(
        sessions=sessions,
        total=total,
        limit=limit,
        offset=offset
    )

@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new training session"""
    
    session = SessionModel(
        user_id=current_user.id,
        name=session_data.name,
        started_at=datetime.utcnow()
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return session

@router.patch("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: int,
    session_data: SessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a training session"""
    
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )
    
    # Update fields
    if session_data.name is not None:
        session.name = session_data.name
    if session_data.ended_at is not None:
        session.ended_at = session_data.ended_at
    
    db.commit()
    db.refresh(session)
    
    return session

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific training session"""
    
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )
    
    return session
