from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from schemas import NotificationPrefsUpdate, NotificationPrefsResponse, WeeklyReportData
from services.notifications import NotificationService

router = APIRouter()
notification_service = NotificationService()

@router.get("/notifications/prefs", response_model=NotificationPrefsResponse)
async def get_notification_prefs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user notification preferences"""
    prefs = notification_service.get_user_prefs(db, current_user.id)
    
    if not prefs:
        # Return default preferences
        return NotificationPrefsResponse(
            email_enabled=True,
            webhook_enabled=False,
            webhook_url=None
        )
    
    return NotificationPrefsResponse(
        email_enabled=prefs.email_enabled,
        webhook_enabled=prefs.webhook_enabled,
        webhook_url=prefs.webhook_url
    )

@router.patch("/notifications/prefs", response_model=NotificationPrefsResponse)
async def update_notification_prefs(
    prefs_data: NotificationPrefsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user notification preferences"""
    prefs = notification_service.upsert_prefs(db, current_user.id, prefs_data.dict(exclude_unset=True))
    
    return NotificationPrefsResponse(
        email_enabled=prefs.email_enabled,
        webhook_enabled=prefs.webhook_enabled,
        webhook_url=prefs.webhook_url
    )

@router.post("/notifications/test")
async def send_test_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a test notification to the current user"""
    if not current_user.email_verified:
        raise HTTPException(status_code=400, detail="Email must be verified to receive notifications")
    
    # Generate test report
    report_data = notification_service.generate_weekly_report(db, current_user.id)
    
    # Get user preferences
    prefs = notification_service.get_user_prefs(db, current_user.id)
    
    results = {"emails_sent": 0, "webhooks_sent": 0, "errors": 0}
    
    # Send test email
    if not prefs or prefs.email_enabled:
        if notification_service.send_email_report(current_user, report_data):
            results["emails_sent"] = 1
        else:
            results["errors"] += 1
    
    # Send test webhook
    if prefs and prefs.webhook_enabled and prefs.webhook_url:
        if notification_service.send_webhook_report(prefs.webhook_url, current_user, report_data):
            results["webhooks_sent"] = 1
        else:
            results["errors"] += 1
    
    return {
        "message": "Test notification sent",
        "results": results
    }