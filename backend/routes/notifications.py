from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user, csrf_protected_user
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
    current_user: User = Depends(csrf_protected_user)
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
    current_user: User = Depends(csrf_protected_user)
):
    """Send a test notification to the current user"""
    # In development mode, allow test notifications even without email verification
    import os
    is_development = os.getenv("ENVIRONMENT", "development") == "development"
    
    if not current_user.email_verified and not is_development:
        raise HTTPException(status_code=400, detail="Please verify your email address first. Check your inbox for a verification link.")
    
    # Generate test report
    report_data = notification_service.generate_weekly_report(db, current_user.id)
    
    # Get user preferences
    prefs = notification_service.get_user_prefs(db, current_user.id)
    
    results = {"emails_sent": 0, "webhooks_sent": 0, "errors": 0}
    error_messages = []
    
    # Send test email
    if not prefs or prefs.email_enabled:
        if notification_service.send_email_report(current_user, report_data):
            results["emails_sent"] = 1
        else:
            results["errors"] += 1
            error_messages.append("Email service not configured. Please set up SMTP or SendGrid.")
    
    # Send test webhook
    if prefs and prefs.webhook_enabled and prefs.webhook_url:
        if notification_service.send_webhook_report(prefs.webhook_url, current_user, report_data):
            results["webhooks_sent"] = 1
        else:
            results["errors"] += 1
            error_messages.append("Webhook failed to send.")
    
    # If no notifications were sent and there are errors, provide helpful message
    if results["emails_sent"] == 0 and results["webhooks_sent"] == 0 and results["errors"] > 0:
        if error_messages:
            raise HTTPException(status_code=400, detail="; ".join(error_messages))
    
    return {
        "message": "Test notification sent",
        "results": results
    }