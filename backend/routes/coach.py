from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from database import get_db
from models import User, CoachAthlete, Session, Punch
from schemas import CoachInvite, CoachInviteResponse, CoachAcceptInvite, AthleteSummary, CoachAthletesResponse
from auth import get_current_user, get_current_coach, csrf_protected_user
from datetime import datetime, timedelta
import secrets
import string

router = APIRouter()

def generate_invite_code() -> str:
    """Generate a short invite code"""
    return ''.join(secrets.choices(string.ascii_uppercase + string.digits, k=8))

@router.post("/invite", response_model=CoachInviteResponse)
async def invite_athlete(
    invite_data: CoachInvite,
    current_user: User = Depends(csrf_protected_user),
    db: Session = Depends(get_db)
):
    """Create an invite code for an athlete"""
    
    # Find athlete by email
    athlete = db.query(User).filter(
        and_(
            User.email == invite_data.athlete_email,
            User.role == "athlete"
        )
    ).first()
    
    if not athlete:
        raise HTTPException(
            status_code=404,
            detail="Athlete not found with that email"
        )
    
    # Check if relationship already exists
    existing = db.query(CoachAthlete).filter(
        and_(
            CoachAthlete.coach_id == current_user.id,
            CoachAthlete.athlete_id == athlete.id
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Athlete is already linked to you"
        )
    
    # Generate invite code (in a real app, you'd store this in a table)
    invite_code = generate_invite_code()
    
    # For MVP, we'll create the relationship directly
    # In production, you'd store the invite code and have a separate accept flow
    coach_athlete = CoachAthlete(
        coach_id=current_user.id,
        athlete_id=athlete.id
    )
    
    db.add(coach_athlete)
    db.commit()
    
    return CoachInviteResponse(invite_code=invite_code)

@router.post("/accept")
async def accept_invite(
    accept_data: CoachAcceptInvite,
    current_user: User = Depends(csrf_protected_user),
    db: Session = Depends(get_db)
):
    """Accept a coach invite (simplified for MVP)"""
    
    # In a real implementation, you'd validate the invite code
    # For MVP, we'll just return success
    return {"message": "Invite accepted successfully"}

@router.get("/athletes", response_model=CoachAthletesResponse)
async def get_athletes(
    current_user: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    """Get list of athletes with their latest stats"""
    
    # Get all athletes linked to this coach
    relationships = db.query(CoachAthlete).filter(
        CoachAthlete.coach_id == current_user.id
    ).all()
    
    athlete_ids = [rel.athlete_id for rel in relationships]
    
    if not athlete_ids:
        return CoachAthletesResponse(athletes=[])
    
    # Get athlete summaries with last 7 days stats
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    athletes = []
    for athlete_id in athlete_ids:
        athlete = db.query(User).filter(User.id == athlete_id).first()
        if not athlete:
            continue
        
        # Get last 7 days stats
        recent_sessions = db.query(Session).filter(
            and_(
                Session.user_id == athlete_id,
                Session.started_at >= week_ago
            )
        ).all()
        
        recent_punches = db.query(Punch).join(Session).filter(
            and_(
                Session.user_id == athlete_id,
                Punch.timestamp >= week_ago
            )
        ).all()
        
        total_punches = sum(p.count for p in recent_punches)
        avg_speed = sum(p.speed * p.count for p in recent_punches) / max(len(recent_punches), 1)
        
        last_session = db.query(Session).filter(
            Session.user_id == athlete_id
        ).order_by(desc(Session.started_at)).first()
        
        athlete_summary = AthleteSummary(
            id=athlete.id,
            username=athlete.username,
            email=athlete.email,
            total_punches=total_punches,
            average_speed=round(avg_speed, 2),
            sessions_count=len(recent_sessions),
            last_session_date=last_session.started_at if last_session else None
        )
        
        athletes.append(athlete_summary)
    
    return CoachAthletesResponse(athletes=athletes)
