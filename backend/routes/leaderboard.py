from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from schemas import LeaderboardResponse, LeaderboardEntry
from services.leaderboard import LeaderboardService
from datetime import datetime, timedelta

router = APIRouter()
leaderboard_service = LeaderboardService()

@router.get("/coach/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    range: str = Query("week", description="Time range for leaderboard"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get weekly leaderboard for coach's athletes"""
    if current_user.role != "coach":
        raise HTTPException(status_code=403, detail="Only coaches can access leaderboard")
    
    if range != "week":
        raise HTTPException(status_code=400, detail="Only weekly leaderboard is supported")
    
    # Get leaderboard data
    leaderboard_data = leaderboard_service.get_weekly_leaderboard(db, current_user.id)
    
    # Calculate week boundaries
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    
    # Convert to response format
    entries = [
        LeaderboardEntry(
            athlete_id=entry["athlete_id"],
            athlete_name=entry["athlete_name"],
            total_punches=entry["total_punches"],
            avg_speed=entry["avg_speed"],
            rank=entry["rank"],
            daily_punches=entry["daily_punches"]
        )
        for entry in leaderboard_data
    ]
    
    return LeaderboardResponse(
        entries=entries,
        week_start=week_start,
        week_end=now
    )
