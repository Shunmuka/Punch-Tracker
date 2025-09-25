from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os

from database import get_db, get_redis
from models import Workout, WorkoutSegment, Punch, User
from auth import get_current_user, csrf_protected_user
from schemas import WorkoutStartResponse, WorkoutSummary, WorkoutTemplate, WorkoutStartRequest

router = APIRouter()

def _inactivity_minutes() -> int:
    return int(os.getenv("INACTIVITY_MINUTES", "3"))

# Predefined workout templates
WORKOUT_TEMPLATES = {
    "sparring": WorkoutTemplate(
        name="Sparring",
        rounds=6,
        round_duration_seconds=180,  # 3 minutes
        rest_duration_seconds=60,    # 1 minute
        description="6 rounds of 3-minute sparring with 1-minute rest"
    ),
    "heavy_bag": WorkoutTemplate(
        name="Heavy Bag",
        rounds=8,
        round_duration_seconds=180,  # 3 minutes
        rest_duration_seconds=60,    # 1 minute
        description="8 rounds of 3-minute heavy bag work with 1-minute rest"
    ),
    "speed_bag": WorkoutTemplate(
        name="Speed Bag",
        rounds=10,
        round_duration_seconds=120,  # 2 minutes
        rest_duration_seconds=30,    # 30 seconds
        description="10 rounds of 2-minute speed bag with 30-second rest"
    ),
    "conditioning": WorkoutTemplate(
        name="Conditioning",
        rounds=4,
        round_duration_seconds=300,  # 5 minutes
        rest_duration_seconds=120,   # 2 minutes
        description="4 rounds of 5-minute conditioning with 2-minute rest"
    )
}

@router.get("/workouts/templates", response_model=dict[str, WorkoutTemplate])
async def get_workout_templates():
    """Get available workout templates"""
    return WORKOUT_TEMPLATES

@router.post("/workouts/start", response_model=WorkoutStartResponse)
async def start_workout(request: WorkoutStartRequest = None, db: Session = Depends(get_db), current_user: User = Depends(csrf_protected_user)):
    active = db.query(Workout).filter(Workout.user_id == current_user.id, Workout.ended_at == None).first()
    if active:
        template = WORKOUT_TEMPLATES.get(request.template_name) if request and request.template_name else None
        return {"id": active.id, "started_at": active.started_at, "template": template}
    
    w = Workout(user_id=current_user.id, auto_detected=False, started_at=datetime.utcnow())
    db.add(w)
    db.commit()
    db.refresh(w)
    
    # If template specified, create planned segments
    template = None
    if request and request.template_name:
        template = WORKOUT_TEMPLATES.get(request.template_name)
        if template:
            _create_planned_segments(db, w, template)
    
    return {"id": w.id, "started_at": w.started_at, "template": template}

@router.post("/workouts/stop", response_model=WorkoutStartResponse)
async def stop_workout(db: Session = Depends(get_db), current_user: User = Depends(csrf_protected_user)):
    active = db.query(Workout).filter(Workout.user_id == current_user.id, Workout.ended_at == None).first()
    if not active:
        # Gracefully return the most recent workout so the UI can navigate
        last = (
            db.query(Workout)
            .filter(Workout.user_id == current_user.id)
            .order_by(Workout.started_at.desc())
            .first()
        )
        if not last:
            raise HTTPException(status_code=400, detail="No active workout")
        return {"id": last.id, "started_at": last.started_at}
    active.ended_at = datetime.utcnow()
    db.commit()

    # Generate segments upon stop (best-effort)
    try:
        _generate_segments_for_workout(db, active)
    except Exception:
        pass
    return {"id": active.id, "started_at": active.started_at}

@router.get("/workouts/active", response_model=WorkoutStartResponse | None)
async def active_workout(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    active = db.query(Workout).filter(Workout.user_id == current_user.id, Workout.ended_at == None).first()
    if not active:
        return None
    return {"id": active.id, "started_at": active.started_at}

def _build_summary(workout: Workout, punches: list[Punch]) -> dict:
    total = sum(p.count for p in punches)
    avg_speed = (sum(p.speed * p.count for p in punches) / total) if total else 0.0
    duration = None
    if workout.ended_at:
        duration = int((workout.ended_at - workout.started_at).total_seconds())
    segments = [
        {
            "id": s.id,
            "kind": s.kind,
            "started_at": s.started_at.isoformat(),
            "ended_at": s.ended_at.isoformat(),
            "target_seconds": s.target_seconds,
        }
        for s in workout.segments
    ]
    rounds = len([s for s in workout.segments if s.kind == "active"]) 
    rests = len([s for s in workout.segments if s.kind == "rest"]) 
    return {
        "id": workout.id,
        "user_id": workout.user_id,
        "started_at": workout.started_at,
        "ended_at": workout.ended_at,
        "total_punches": total,
        "average_speed": round(avg_speed, 2),
        "duration_seconds": duration,
        "rounds": rounds,
        "rests": rests,
        "segments": segments,
    }

@router.get("/workouts/{workout_id}/summary", response_model=WorkoutSummary)
async def workout_summary(workout_id: int, db: Session = Depends(get_db), redis = Depends(get_redis), current_user: User = Depends(get_current_user)):
    cache_key = f"workout:summary:{workout_id}"
    cached = None
    try:
        cached = redis.get(cache_key)
    except Exception:
        cached = None
    if cached:
        import json
        return WorkoutSummary(**json.loads(cached))
    w = db.query(Workout).filter(Workout.id == workout_id, Workout.user_id == current_user.id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Workout not found")
    punches = db.query(Punch).filter(Punch.workout_id == w.id).all()
    data = _build_summary(w, punches)
    try:
        import json
        redis.setex(cache_key, 300, json.dumps(data, default=str))
    except Exception:
        pass
    return WorkoutSummary(**data)


def _generate_segments_for_workout(db: Session, workout: Workout) -> None:
    """Create simple active/rest segments based on punch gaps.

    Rules:
    - A gap >= SEGMENT_REST_MIN_S counts as a rest segment between punches
    - Active segments are the punch clusters between rests
    - Optionally drop too-short segments via SEGMENT_ACTIVE_MIN_S (default 40s)
    """
    rest_gap_s = int(os.getenv("SEGMENT_REST_MIN_S", "15"))
    min_active_s = int(os.getenv("SEGMENT_ACTIVE_MIN_S", "40"))

    # Do not duplicate if segments already exist
    existing = db.query(WorkoutSegment).filter(WorkoutSegment.workout_id == workout.id).count()
    if existing:
        return

    # Fetch punches ordered
    punches = (
        db.query(Punch)
        .filter(Punch.workout_id == workout.id)
        .order_by(Punch.timestamp.asc())
        .all()
    )
    if not punches:
        return

    segments_to_add: list[WorkoutSegment] = []

    # Initialize first active segment
    current_start = punches[0].timestamp
    last_ts = punches[0].timestamp

    for p in punches[1:]:
        gap = (p.timestamp - last_ts).total_seconds()
        if gap >= rest_gap_s:
            # close active at last_ts
            active_end = last_ts
            active_duration = (active_end - current_start).total_seconds()
            if active_duration >= max(1, min_active_s):
                segments_to_add.append(
                    WorkoutSegment(
                        workout_id=workout.id,
                        kind="active",
                        started_at=current_start,
                        ended_at=active_end,
                        target_seconds=None,
                    )
                )
            # insert rest from last_ts to p.timestamp
            segments_to_add.append(
                WorkoutSegment(
                    workout_id=workout.id,
                    kind="rest",
                    started_at=active_end,
                    ended_at=p.timestamp,
                    target_seconds=None,
                )
            )
            # start new active at this punch
            current_start = p.timestamp
        last_ts = p.timestamp

    # Close trailing active up to workout end (or last punch)
    tail_end = workout.ended_at or last_ts
    if tail_end < last_ts:
        tail_end = last_ts
    tail_duration = (tail_end - current_start).total_seconds()
    if tail_duration >= 1:
        segments_to_add.append(
            WorkoutSegment(
                workout_id=workout.id,
                kind="active",
                started_at=current_start,
                ended_at=tail_end,
                target_seconds=None,
            )
        )

    if segments_to_add:
        db.add_all(segments_to_add)
        db.commit()


def _create_planned_segments(db: Session, workout: Workout, template: WorkoutTemplate) -> None:
    """Create planned segments based on workout template"""
    current_time = workout.started_at
    
    for round_num in range(template.rounds):
        # Create active segment (round)
        round_start = current_time
        round_end = round_start + timedelta(seconds=template.round_duration_seconds)
        
        db.add(WorkoutSegment(
            workout_id=workout.id,
            kind="active",
            started_at=round_start,
            ended_at=round_end,
            target_seconds=template.round_duration_seconds
        ))
        
        # Create rest segment (except after last round)
        if round_num < template.rounds - 1:
            rest_start = round_end
            rest_end = rest_start + timedelta(seconds=template.rest_duration_seconds)
            
            db.add(WorkoutSegment(
                workout_id=workout.id,
                kind="rest",
                started_at=rest_start,
                ended_at=rest_end,
                target_seconds=template.rest_duration_seconds
            ))
            
            current_time = rest_end
        else:
            current_time = round_end
    
    db.commit()


