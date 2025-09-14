from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from models import User, CoachAthlete, Punch, Workout

class LeaderboardService:
    def get_weekly_leaderboard(self, db: Session, coach_id: int) -> List[Dict[str, Any]]:
        """Get weekly leaderboard for coach's athletes"""
        # Calculate week boundaries
        now = datetime.utcnow()
        week_start = now - timedelta(days=7)
        
        # Get coach's athletes
        athletes = db.query(User).join(CoachAthlete).filter(
            CoachAthlete.coach_id == coach_id,
            User.role == "athlete"
        ).all()
        
        if not athletes:
            return []
        
        athlete_ids = [athlete.id for athlete in athletes]
        
        # Get weekly punch data for each athlete
        leaderboard_data = []
        
        for athlete in athletes:
            # Get punches for this week
            punches = db.query(Punch).join(Workout).filter(
                Workout.user_id == athlete.id,
                Punch.timestamp >= week_start
            ).all()
            
            total_punches = sum(punch.count for punch in punches)
            avg_speed = 0
            if punches:
                total_speed_weighted = sum(punch.speed * punch.count for punch in punches)
                avg_speed = total_speed_weighted / total_punches
            
            # Get daily punches for sparkline (last 7 days)
            daily_punches = []
            for i in range(7):
                day_start = week_start + timedelta(days=i)
                day_end = day_start + timedelta(days=1)
                
                day_punches = db.query(Punch).join(Workout).filter(
                    Workout.user_id == athlete.id,
                    Punch.timestamp >= day_start,
                    Punch.timestamp < day_end
                ).all()
                
                daily_total = sum(punch.count for punch in day_punches)
                daily_punches.append(daily_total)
            
            leaderboard_data.append({
                "athlete_id": athlete.id,
                "athlete_name": athlete.username,
                "total_punches": total_punches,
                "avg_speed": round(avg_speed, 2),
                "daily_punches": daily_punches
            })
        
        # Sort by total punches (descending)
        leaderboard_data.sort(key=lambda x: x["total_punches"], reverse=True)
        
        # Add ranks (handle ties)
        current_rank = 1
        for i, entry in enumerate(leaderboard_data):
            if i > 0 and entry["total_punches"] != leaderboard_data[i-1]["total_punches"]:
                current_rank = i + 1
            entry["rank"] = current_rank
        
        return leaderboard_data
