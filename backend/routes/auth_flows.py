from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import EmailVerifyRequest, ForgotPasswordRequest, ResetPasswordRequest
from services.auth_flows import AuthFlowService
from auth import get_password_hash

router = APIRouter()
auth_flow_service = AuthFlowService()

@router.post("/auth/verify")
async def verify_email(
    request: EmailVerifyRequest,
    db: Session = Depends(get_db)
):
    """Verify email address with token"""
    user = auth_flow_service.verify_email_token(db, request.token)
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    return {"message": "Email verified successfully"}

@router.post("/auth/forgot")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Send password reset email"""
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Send reset email
    success = auth_flow_service.send_password_reset_email(db, user)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send reset email")
    
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/auth/reset")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    user = auth_flow_service.verify_password_reset_token(db, request.token)
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}
