"""
Seed script to populate the database with sample data
"""
import sys
import os
from datetime import datetime, timedelta
import random
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User, Session, Punch

def create_sample_data():
    """Create sample users, sessions, and punches"""
    
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("✅ Sample data already exists.")
            return

        # Create sample user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash="$2b$12$dummyhash.for.seeding.purpose",
            role="athlete"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create sample session
        session = Session(
            user_id=user.id,
            name="Morning Training Session",
            started_at=datetime.now() - timedelta(hours=1),
            ended_at=datetime.now()
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # Create sample punches
        punch_types = ["jab", "cross", "hook", "uppercut"]
        
        for i in range(50):  # 50 sample punches
            punch = Punch(
                session_id=session.id,
                punch_type=random.choice(punch_types),
                speed=random.uniform(15.0, 35.0),  # 15-35 mph
                count=random.randint(1, 3),
                timestamp=session.started_at + timedelta(minutes=i),
                notes=f"Punch {i+1}" if i % 10 == 0 else None
            )
            db.add(punch)
        
        db.commit()
        
        print(f"✅ Created sample data:")
        print(f"   - User: {user.username} (ID: {user.id})")
        print(f"   - Session: {session.name} (ID: {session.id})")
        print(f"   - Punches: 50 sample punches")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
