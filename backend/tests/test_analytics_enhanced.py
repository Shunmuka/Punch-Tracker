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
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_analytics.db"
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
def test_user(setup_database):
    """Create a test user and return auth token"""
    # Create user
    client.post("/auth/signup", json={
        "username": "analyticsuser",
        "email": "analytics@example.com",
        "password": "testpassword123",
        "role": "athlete"
    })
    
    # Login
    response = client.post("/auth/login", json={
        "email": "analytics@example.com",
        "password": "testpassword123"
    })
    
    return response.json()["access_token"]

def test_weekly_analytics(test_user):
    """Test weekly analytics endpoint"""
    headers = {"Authorization": f"Bearer {test_user}"}
    
    response = client.get("/api/analytics/weekly", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # Check required fields
    assert "this_week" in data
    assert "last_week" in data
    assert "delta_percent" in data
    assert "sparkline_data" in data
    assert "fatigue_proxy" in data
    
    # Check data types
    assert isinstance(data["this_week"], dict)
    assert isinstance(data["last_week"], dict)
    assert isinstance(data["delta_percent"], (int, float))
    assert isinstance(data["sparkline_data"], list)
    assert data["fatigue_proxy"] is None or isinstance(data["fatigue_proxy"], (int, float))

def test_weekly_analytics_with_data(test_user):
    """Test weekly analytics with actual punch data"""
    headers = {"Authorization": f"Bearer {test_user}"}
    
    # Create a session
    session_response = client.post("/api/sessions", 
        json={"name": "Test Session"},
        headers=headers
    )
    session_id = session_response.json()["id"]
    
    # Add some punches
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    
    # Create punches for this week
    for i in range(5):
        client.post("/api/punches", json={
            "session_id": session_id,
            "punch_type": "jab",
            "speed": 25.0 + i,
            "count": 1,
            "notes": f"Test punch {i}"
        }, headers=headers)
    
    # Get weekly analytics
    response = client.get("/api/analytics/weekly", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # Should have some data now
    assert data["this_week"]["total_punches"] >= 5
    assert data["this_week"]["avg_speed"] > 0
    assert len(data["sparkline_data"]) == 4  # 4 weeks of data

def test_weekly_analytics_unauthorized():
    """Test weekly analytics without authentication"""
    response = client.get("/api/analytics/weekly")
    
    assert response.status_code == 401
