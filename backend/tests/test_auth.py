import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import get_db, Base
from models import User
from auth import get_password_hash

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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

def test_user_signup(setup_database):
    """Test user signup"""
    response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "athlete"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["role"] == "athlete"
    assert "id" in data

def test_user_signup_duplicate_email(setup_database):
    """Test signup with duplicate email"""
    # First signup
    client.post("/auth/signup", json={
        "username": "testuser1",
        "email": "duplicate@example.com",
        "password": "testpassword123",
        "role": "athlete"
    })
    
    # Second signup with same email
    response = client.post("/auth/signup", json={
        "username": "testuser2",
        "email": "duplicate@example.com",
        "password": "testpassword123",
        "role": "athlete"
    })
    
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_user_login(setup_database):
    """Test user login"""
    # First create a user
    client.post("/auth/signup", json={
        "username": "logintest",
        "email": "login@example.com",
        "password": "testpassword123",
        "role": "athlete"
    })
    
    # Then login
    response = client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "testpassword123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_user_login_invalid_credentials(setup_database):
    """Test login with invalid credentials"""
    response = client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    })
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_get_current_user(setup_database):
    """Test getting current user profile"""
    # Create user and login
    client.post("/auth/signup", json={
        "username": "profiletest",
        "email": "profile@example.com",
        "password": "testpassword123",
        "role": "coach"
    })
    
    login_response = client.post("/auth/login", json={
        "email": "profile@example.com",
        "password": "testpassword123"
    })
    
    token = login_response.json()["access_token"]
    
    # Get profile
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "profiletest"
    assert data["email"] == "profile@example.com"
    assert data["role"] == "coach"

def test_get_current_user_invalid_token(setup_database):
    """Test getting current user with invalid token"""
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalid_token"})
    
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]
