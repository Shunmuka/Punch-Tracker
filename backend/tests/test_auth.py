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
    assert "access_token" in response.cookies
    assert "csrf_token" in response.cookies
    assert "csrf_token" in response.json()

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
    
    client.post("/auth/login", json={
        "email": "profile@example.com",
        "password": "testpassword123"
    })
    
    # Get profile
    response = client.get("/auth/me")
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "profiletest"
    assert data["email"] == "profile@example.com"
    assert data["role"] == "coach"

def test_get_current_user_no_cookie(setup_database):
    """Test getting current user with no cookie"""
    # Clear any existing cookies in the client
    client.cookies.clear()
    response = client.get("/auth/me")
    
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_csrf_protection(setup_database):
    """Test CSRF protection on a protected endpoint"""
    # Create user and login
    client.post("/auth/signup", json={
        "username": "csrftest",
        "email": "csrf@example.com",
        "password": "testpassword123",
        "role": "athlete"
    })
    
    login_response = client.post("/auth/login", json={
        "email": "csrf@example.com",
        "password": "testpassword123"
    })
    
    csrf_token = login_response.json()["csrf_token"]
    
    # Test with valid CSRF token
    response = client.post("/auth/protected", headers={"X-CSRF-Token": csrf_token})
    assert response.status_code == 200
    
    # Test with invalid CSRF token
    response = client.post("/auth/protected", headers={"X-CSRF-Token": "invalid_token"})
    assert response.status_code == 403
    
    # Test with no CSRF token
    response = client.post("/auth/protected")
    assert response.status_code == 403
