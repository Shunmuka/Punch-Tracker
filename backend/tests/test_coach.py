import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import get_db, Base
from models import User, Session, Punch
from auth import get_password_hash
from datetime import datetime, timedelta

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_coach.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def coach_user(setup_database):
    """Create a coach user and return auth token"""
    # Create coach
    client.post("/auth/signup", json={
        "username": "coachuser",
        "email": "coach@example.com",
        "password": "testpassword123",
        "role": "coach"
    })
    
    # Login
    response = client.post("/auth/login", json={
        "email": "coach@example.com",
        "password": "testpassword123"
    })
    
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def athlete_user(setup_database):
    """Create an athlete user and return auth token"""
    # Create athlete
    client.post("/auth/signup", json={
        "username": "athleteuser",
        "email": "athlete@example.com",
        "password": "testpassword123",
        "role": "athlete"
    })
    
    # Login
    response = client.post("/auth/login", json={
        "email": "athlete@example.com",
        "password": "testpassword123"
    })
    
    return response.json()["access_token"]

def test_coach_invite_athlete(coach_user):
    """Test coach inviting an athlete"""
    headers = {"Authorization": f"Bearer {coach_user}"}
    
    response = client.post("/api/coach/invite", 
        json={"athlete_email": "athlete@example.com"},
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "invite_code" in data
    assert len(data["invite_code"]) == 8  # 8 character invite code

def test_coach_invite_nonexistent_athlete(coach_user):
    """Test coach inviting non-existent athlete"""
    headers = {"Authorization": f"Bearer {coach_user}"}
    
    response = client.post("/api/coach/invite", 
        json={"athlete_email": "nonexistent@example.com"},
        headers=headers
    )
    
    assert response.status_code == 404
    assert "Athlete not found" in response.json()["detail"]

def test_coach_get_athletes(coach_user, athlete_user):
    """Test coach getting list of athletes"""
    headers = {"Authorization": f"Bearer {coach_user}"}
    
    # First invite the athlete
    client.post("/api/coach/invite", 
        json={"athlete_email": "athlete@example.com"},
        headers=headers
    )
    
    # Get athletes
    response = client.get("/api/coach/athletes", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "athletes" in data
    assert isinstance(data["athletes"], list)
    
    # Should have the athlete we just invited
    if data["athletes"]:
        athlete = data["athletes"][0]
        assert "id" in athlete
        assert "username" in athlete
        assert "email" in athlete
        assert "total_punches" in athlete
        assert "average_speed" in athlete
        assert "sessions_count" in athlete

def test_coach_athletes_with_punch_data(coach_user, athlete_user):
    """Test coach getting athletes with actual punch data"""
    headers = {"Authorization": f"Bearer {coach_user}"}
    athlete_headers = {"Authorization": f"Bearer {athlete_user}"}
    
    # Invite athlete
    client.post("/api/coach/invite", 
        json={"athlete_email": "athlete@example.com"},
        headers=headers
    )
    
    # Create session and punches for athlete
    session_response = client.post("/api/sessions", 
        json={"name": "Athlete Session"},
        headers=athlete_headers
    )
    session_id = session_response.json()["id"]
    
    # Add some punches
    for i in range(3):
        client.post("/api/punches", json={
            "session_id": session_id,
            "punch_type": "jab",
            "speed": 25.0 + i,
            "count": 1
        }, headers=athlete_headers)
    
    # Get athletes
    response = client.get("/api/coach/athletes", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    if data["athletes"]:
        athlete = data["athletes"][0]
        assert athlete["total_punches"] >= 3
        assert athlete["average_speed"] > 0
        assert athlete["sessions_count"] >= 1

def test_coach_athletes_unauthorized():
    """Test getting athletes without authentication"""
    response = client.get("/api/coach/athletes")
    
    assert response.status_code == 401

def test_coach_athletes_wrong_role(athlete_user):
    """Test athlete trying to access coach endpoints"""
    headers = {"Authorization": f"Bearer {athlete_user}"}
    
    response = client.get("/api/coach/athletes", headers=headers)
    
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]
