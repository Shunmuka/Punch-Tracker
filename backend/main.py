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
from routes import workouts
from notifications import notification_service

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
AUTH_REQUESTS = Counter('auth_requests_total', 'Authentication requests', ['endpoint', 'status'])
NOTIFICATION_REQUESTS = Counter('notification_requests_total', 'Notification requests', ['type', 'status'])

app = FastAPI(
    title="PunchTracker API",
    description="API for tracking boxing punch sessions with authentication and analytics",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(sessions.router, prefix="/api", tags=["sessions"])
app.include_router(punches.router, prefix="/api", tags=["punches"])
# Register enhanced analytics first so static routes like /analytics/weekly are matched
app.include_router(analytics_enhanced.router, prefix="/api", tags=["analytics-enhanced"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(workouts.router, tags=["workouts"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(coach.router, prefix="/api/coach", tags=["coach"])

# Scheduler for weekly reports
scheduler = BackgroundScheduler()

def send_weekly_reports():
    """Send weekly reports to all users with email enabled"""
    db = next(get_db())
    try:
        users = db.query(User).join(User.notification_prefs).filter(
            User.notification_prefs.has(email_enabled=True)
        ).all()
        
        for user in users:
            try:
                notification_service.send_weekly_report(user, db)
                NOTIFICATION_REQUESTS.labels(type="weekly_report", status="success").inc()
            except Exception as e:
                print(f"Failed to send weekly report to {user.email}: {e}")
                NOTIFICATION_REQUESTS.labels(type="weekly_report", status="error").inc()
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
    
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_DURATION.observe(duration)
    
    # Track auth endpoints
    if request.url.path.startswith("/auth/"):
        AUTH_REQUESTS.labels(endpoint=request.url.path, status=response.status_code).inc()
    
    # Track notification endpoints
    if request.url.path.startswith("/api/notifications/"):
        NOTIFICATION_REQUESTS.labels(type="api", status=response.status_code).inc()
    
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
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown scheduler on app shutdown"""
    scheduler.shutdown()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
