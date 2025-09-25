import os
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from models import User, EmailVerifyToken, PasswordResetToken
from services.notifications import NotificationService

class AuthFlowService:
    def __init__(self):
        self.email_verify_ttl = int(os.getenv("EMAIL_VERIFY_TOKEN_TTL_MIN", "60"))
        self.password_reset_ttl = int(os.getenv("PASSWORD_RESET_TOKEN_TTL_MIN", "60"))
        self.notification_service = NotificationService()

    def create_email_verify_token(self, db: Session, user_id: int) -> str:
        """Create email verification token"""
        # Delete any existing tokens
        db.query(EmailVerifyToken).filter(EmailVerifyToken.user_id == user_id).delete()
        
        # Generate token
        token = secrets.token_urlsafe(32)
        token_hash = self._hash_token(token)
        expires_at = datetime.utcnow() + timedelta(minutes=self.email_verify_ttl)
        
        # Create token record
        token_record = EmailVerifyToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(token_record)
        db.commit()
        
        return token

    def verify_email_token(self, db: Session, token: str) -> Optional[User]:
        """Verify email verification token"""
        token_hash = self._hash_token(token)
        
        token_record = db.query(EmailVerifyToken).filter(
            EmailVerifyToken.token_hash == token_hash,
            EmailVerifyToken.used_at == None,
            EmailVerifyToken.expires_at > datetime.utcnow()
        ).first()
        
        if not token_record:
            return None
        
        # Mark token as used
        token_record.used_at = datetime.utcnow()
        
        # Mark user as verified
        user = db.query(User).filter(User.id == token_record.user_id).first()
        if user:
            user.email_verified = True
            db.commit()
            return user
        
        return None

    def create_password_reset_token(self, db: Session, user_id: int) -> str:
        """Create password reset token"""
        # Delete any existing tokens
        db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete()
        
        # Generate token
        token = secrets.token_urlsafe(32)
        token_hash = self._hash_token(token)
        expires_at = datetime.utcnow() + timedelta(minutes=self.password_reset_ttl)
        
        # Create token record
        token_record = PasswordResetToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(token_record)
        db.commit()
        
        return token

    def verify_password_reset_token(self, db: Session, token: str) -> Optional[User]:
        """Verify password reset token"""
        token_hash = self._hash_token(token)
        
        token_record = db.query(PasswordResetToken).filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at == None,
            PasswordResetToken.expires_at > datetime.utcnow()
        ).first()
        
        if not token_record:
            return None
        
        # Mark token as used
        token_record.used_at = datetime.utcnow()
        db.commit()
        
        # Return user
        return db.query(User).filter(User.id == token_record.user_id).first()

    def send_verification_email(self, db: Session, user: User) -> bool:
        """Send email verification email"""
        token = self.create_email_verify_token(db, user.id)
        
        # Create verification URL
        base_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        verify_url = f"{base_url}/auth/verify?token={token}"
        
        # Send email
        subject = "Verify Your Email - PunchTracker"
        html_content = f"""
        <html>
        <body>
            <h2>Verify Your Email</h2>
            <p>Hello {user.username},</p>
            <p>Please click the link below to verify your email address:</p>
            <p><a href="{verify_url}">Verify Email</a></p>
            <p>This link will expire in {self.email_verify_ttl} minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>- PunchTracker Team</p>
        </body>
        </html>
        """
        
        return self.notification_service.send_email(user.email, subject, html_content)

    def send_password_reset_email(self, db: Session, user: User) -> bool:
        """Send password reset email"""
        token = self.create_password_reset_token(db, user.id)
        
        # Create reset URL
        base_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_url = f"{base_url}/auth/reset?token={token}"
        
        # Send email
        subject = "Reset Your Password - PunchTracker"
        html_content = f"""
        <html>
        <body>
            <h2>Reset Your Password</h2>
            <p>Hello {user.username},</p>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <p><a href="{reset_url}">Reset Password</a></p>
            <p>This link will expire in {self.password_reset_ttl} minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>- PunchTracker Team</p>
        </body>
        </html>
        """
        
        return self.notification_service.send_email(user.email, subject, html_content)

    def _hash_token(self, token: str) -> str:
        """Hash a token for storage"""
        return hashlib.sha256(token.encode('utf-8')).hexdigest()
