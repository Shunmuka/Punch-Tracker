from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, NotificationPrefs
from schemas import UserSignup, UserLogin, Token, UserProfile
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from datetime import timedelta
import os

router = APIRouter()

@router.post("/signup", response_model=UserProfile)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    """Create a new user account"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create default notification preferences
    notification_prefs = NotificationPrefs(
        user_id=user.id,
        email_enabled=True,
        webhook_enabled=False
    )
    db.add(notification_prefs)
    db.commit()
    
    return user

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=int(os.getenv("JWT_EXPIRE_MINUTES", "1440")))
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user
