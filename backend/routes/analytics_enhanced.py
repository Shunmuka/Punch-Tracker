from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from database import get_db
from models import User, Session, Punch
from schemas import WeeklyAnalytics
from auth import get_current_user
from datetime import datetime, timedelta
import redis
import json
import os

router = APIRouter()

# Redis client for caching (optional)
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        password=os.getenv('REDIS_PASSWORD') or None,
        decode_responses=True
    )
except Exception:  # pragma: no cover
    redis_client = None

@router.get("/analytics/weekly", response_model=WeeklyAnalytics)
async def get_weekly_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly analytics with trends and comparisons"""
    
    # Check cache first
    cache_key = f"weekly:{current_user.id}"
    cached_data = None
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
        except Exception:
            cached_data = None
    if cached_data:
        try:
            return WeeklyAnalytics(**json.loads(cached_data))
        except Exception:
            pass
    
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)
    four_weeks_ago = now - timedelta(days=28)
    
    # This week's data
    this_week_sessions = db.query(Session).filter(
        and_(
            Session.user_id == current_user.id,
            Session.started_at >= week_start
        )
    ).all()
    
    this_week_punches = db.query(Punch).join(Session).filter(
        and_(
            Session.user_id == current_user.id,
            Punch.timestamp >= week_start
        )
    ).all()
    
    # Last week's data
    last_week_sessions = db.query(Session).filter(
        and_(
            Session.user_id == current_user.id,
            Session.started_at >= two_weeks_ago,
            Session.started_at < week_start
        )
    ).all()
    
    last_week_punches = db.query(Punch).join(Session).filter(
        and_(
            Session.user_id == current_user.id,
            Punch.timestamp >= two_weeks_ago,
            Punch.timestamp < week_start
        )
    ).all()
    
    # Calculate this week metrics
    this_week_total = sum(p.count for p in this_week_punches)
    this_week_avg_speed = sum(p.speed * p.count for p in this_week_punches) / max(len(this_week_punches), 1)
    
    # Calculate last week metrics
    last_week_total = sum(p.count for p in last_week_punches)
    last_week_avg_speed = sum(p.speed * p.count for p in last_week_punches) / max(len(last_week_punches), 1)
    
    # Calculate percentage change
    if last_week_total > 0:
        delta_percent = ((this_week_total - last_week_total) / last_week_total) * 100
    else:
        delta_percent = 100 if this_week_total > 0 else 0
    
    # Generate 4-week sparkline data
    sparkline_data = []
    for i in range(4):
        week_end = now - timedelta(days=i*7)
        week_start_spark = week_end - timedelta(days=7)
        
        week_punches = db.query(Punch).join(Session).filter(
            and_(
                Session.user_id == current_user.id,
                Punch.timestamp >= week_start_spark,
                Punch.timestamp < week_end
            )
        ).all()
        
        week_total = sum(p.count for p in week_punches)
        sparkline_data.append({
            "date": week_end.strftime("%Y-%m-%d"),
            "total_punches": week_total
        })
    
    # Calculate fatigue proxy (negative slope of speed across last session)
    fatigue_proxy = None
    if this_week_sessions:
        last_session = max(this_week_sessions, key=lambda s: s.started_at)
        session_punches = db.query(Punch).filter(
            Punch.session_id == last_session.id
        ).order_by(Punch.timestamp).all()
        
        if len(session_punches) > 1:
            # Calculate speed trend (simple linear regression slope)
            speeds = [p.speed for p in session_punches]
            n = len(speeds)
            x_values = list(range(n))
            
            # Calculate slope
            x_mean = sum(x_values) / n
            y_mean = sum(speeds) / n
            
            numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, speeds))
            denominator = sum((x - x_mean) ** 2 for x in x_values)
            
            if denominator != 0:
                slope = numerator / denominator
                fatigue_proxy = -slope  # Negative slope indicates fatigue
    
    # Prepare response
    analytics = WeeklyAnalytics(
        this_week={
            "total_punches": this_week_total,
            "avg_speed": round(this_week_avg_speed, 2),
            "sessions_count": len(this_week_sessions)
        },
        last_week={
            "total_punches": last_week_total,
            "avg_speed": round(last_week_avg_speed, 2),
            "sessions_count": len(last_week_sessions)
        },
        delta_percent=round(delta_percent, 1),
        sparkline_data=sparkline_data,
        fatigue_proxy=round(fatigue_proxy, 3) if fatigue_proxy else None
    )
    
    # Cache for 5 minutes (best-effort)
    if redis_client:
        try:
            redis_client.setex(cache_key, 300, json.dumps(analytics.dict()))
        except Exception:
            pass
    
    return analytics
