from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client.core import CollectorRegistry
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import time
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import get_db, engine
from models import Base, User
from routes import punches, analytics
from routes import auth, sessions, notifications, coach, analytics_enhanced
from routes import workouts, device, auth_flows, leaderboard
from services.notifications import NotificationService
from metrics import get_metrics, get_metrics_content_type

# Load environment variables
load_dotenv()

# Create database tables
# Base.metadata.create_all(bind=engine)

# Prometheus metrics are now defined in metrics.py

app = FastAPI(
    title="PunchTracker API",
    description="API for tracking boxing punch sessions with authentication and analytics",
    version="2.0.0"
)

# CORS middleware
allowed_origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(auth_flows.router, tags=["auth-flows"])
app.include_router(sessions.router, prefix="/api", tags=["sessions"])
app.include_router(punches.router, prefix="/api", tags=["punches"])
# Register enhanced analytics first so static routes like /analytics/weekly are matched
app.include_router(analytics_enhanced.router, prefix="/api", tags=["analytics-enhanced"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(workouts.router, prefix="/api", tags=["workouts"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])
app.include_router(device.router, prefix="/api", tags=["device"])
app.include_router(coach.router, prefix="/api/coach", tags=["coach"])
app.include_router(leaderboard.router, prefix="/api", tags=["leaderboard"])

# Scheduler for weekly reports
scheduler = BackgroundScheduler()

def send_weekly_reports():
    """Send weekly reports to all users with email enabled"""
    db = next(get_db())
    try:
        notification_service = NotificationService()
        results = notification_service.send_weekly_reports(db)
        print(f"Weekly reports sent: {results}")
    except Exception as e:
        print(f"Error in weekly report scheduler: {e}")
    finally:
        db.close()

# Schedule weekly reports
cron_schedule = os.getenv("REPORT_SCHEDULE_CRON", "0 8 * * 1")  # Monday 8 AM
scheduler.add_job(
    send_weekly_reports,
    trigger=CronTrigger.from_crontab(cron_schedule),
    id="weekly_reports",
    name="Send weekly progress reports",
    replace_existing=True
)

scheduler.start()

@app.middleware("http")
async def prometheus_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Record metrics using the centralized metrics module
    from metrics import record_request_metrics
    record_request_metrics(request, response, duration)
    
    return response

@app.get("/")
async def root():
    return {"message": "PunchTracker API v2.0 is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(get_metrics(), media_type=get_metrics_content_type())

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown scheduler on app shutdown"""
    scheduler.shutdown()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
