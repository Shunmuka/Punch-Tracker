from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import User, NotificationPrefs
from schemas import NotificationPrefsUpdate, NotificationPrefsResponse
from auth import get_current_user
from notifications import notification_service

router = APIRouter()

@router.get("/prefs", response_model=NotificationPrefsResponse)
async def get_notification_prefs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notification preferences"""
    
    prefs = db.query(NotificationPrefs).filter(NotificationPrefs.user_id == current_user.id).first()
    
    if not prefs:
        # Create default preferences if they don't exist
        prefs = NotificationPrefs(
            user_id=current_user.id,
            email_enabled=True,
            webhook_enabled=False
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return prefs

@router.patch("/prefs", response_model=NotificationPrefsResponse)
async def update_notification_prefs(
    prefs_data: NotificationPrefsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's notification preferences"""
    
    prefs = db.query(NotificationPrefs).filter(NotificationPrefs.user_id == current_user.id).first()
    
    if not prefs:
        prefs = NotificationPrefs(user_id=current_user.id)
        db.add(prefs)
    
    # Update fields
    if prefs_data.email_enabled is not None:
        prefs.email_enabled = prefs_data.email_enabled
    if prefs_data.webhook_enabled is not None:
        prefs.webhook_enabled = prefs_data.webhook_enabled
    if prefs_data.webhook_url is not None:
        prefs.webhook_url = prefs_data.webhook_url
    
    db.commit()
    db.refresh(prefs)
    
    return prefs

@router.post("/test")
async def test_notification(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a test notification to the current user"""
    
    # Add to background tasks to avoid blocking
    background_tasks.add_task(notification_service.send_weekly_report, current_user, db)
    
    return {"message": "Test notification queued for delivery"}
