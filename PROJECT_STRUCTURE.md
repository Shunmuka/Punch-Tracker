# PunchTracker MVP - Project Structure

## Overview
This is a minimal vertical-slice MVP for tracking boxing punch sessions with basic analytics, built according to the PRD specifications.

## Repository Structure
```
/punchtracker
├── README.md                          # Main documentation
├── env.example                        # Environment variables template
├── setup.sh                          # Linux/Mac setup script
├── setup.bat                         # Windows setup script
├── PROJECT_STRUCTURE.md              # This file
│
├── /backend                          # FastAPI Backend
│   ├── main.py                       # FastAPI application entry point
│   ├── database.py                   # Database configuration & Redis setup
│   ├── models.py                     # SQLAlchemy models (User, Session, Punch)
│   ├── schemas.py                    # Pydantic schemas for API
│   ├── ml_service.py                 # ML service stub (PyTorch placeholder)
│   ├── seed_data.py                  # Database seeding script
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Backend container config
│   ├── /routes                       # API route modules
│   │   ├── __init__.py
│   │   ├── punches.py                # POST /api/punches endpoint
│   │   └── analytics.py              # GET /api/analytics/:sessionId endpoint
│   └── /tests                        # Backend tests
│       └── test_punches.py           # PyTest tests
│
├── /frontend                         # React Frontend
│   ├── package.json                  # Node.js dependencies
│   ├── Dockerfile                    # Frontend container config
│   ├── /public
│   │   └── index.html                # HTML template
│   └── /src
│       ├── index.js                  # React entry point
│       ├── index.css                 # Global styles
│       ├── App.js                    # Main React component with routing
│       ├── App.css                   # Component styles
│       └── /components               # React components
│           ├── Login.js              # Mock login page
│           ├── PunchLogger.js        # Punch logging form
│           ├── Dashboard.js          # Analytics dashboard with Recharts
│           └── /__tests__            # Frontend tests
│               └── PunchLogger.test.js # Jest tests
│
├── /infra                           # Infrastructure & DevOps
│   ├── docker-compose.yml           # Multi-service Docker setup
│   ├── prometheus.yml               # Prometheus configuration
│   └── /grafana                     # Grafana dashboards
│       ├── /datasources
│       │   └── prometheus.yml       # Prometheus datasource config
│       └── /dashboards
│           ├── dashboard.yml        # Dashboard provisioning
│           └── punchtracker-dashboard.json # Sample dashboard
│
└── /.github/workflows               # CI/CD
    └── ci.yml                       # GitHub Actions workflow
```

## Key Features Implemented

### Backend (FastAPI)
- ✅ **POST /api/punches** - Log punch data with validation
- ✅ **GET /api/analytics/:sessionId** - Get session analytics
- ✅ **GET /metrics** - Prometheus metrics endpoint
- ✅ **Database Models** - User, Session, Punch with relationships
- ✅ **Redis Caching** - Session stats caching
- ✅ **ML Service Stub** - PyTorch placeholder for future ML features

### Frontend (React)
- ✅ **Login Page** - Mock authentication
- ✅ **Punch Logger** - Form to log punch data
- ✅ **Dashboard** - Analytics visualization with Recharts
- ✅ **Responsive Design** - Clean, modern UI

### Infrastructure
- ✅ **Docker Compose** - All services orchestrated
- ✅ **PostgreSQL** - Primary database
- ✅ **Redis** - Caching layer
- ✅ **Prometheus** - Metrics collection
- ✅ **Grafana** - Metrics visualization
- ✅ **CI/CD** - GitHub Actions workflow

### Testing
- ✅ **Backend Tests** - PyTest with FastAPI TestClient
- ✅ **Frontend Tests** - Jest with React Testing Library
- ✅ **Linting** - Code quality checks

## Quick Start Commands

### Using Setup Scripts
```bash
# Linux/Mac
./setup.sh

# Windows
setup.bat
```

### Manual Setup
```bash
# 1. Copy environment file
cp env.example .env

# 2. Start all services
cd infra
docker-compose up -d

# 3. Seed database
docker-compose exec backend python seed_data.py

# 4. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Grafana: http://localhost:3001
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/punches` | Log punch data |
| GET | `/api/analytics/:sessionId` | Get session analytics |
| GET | `/metrics` | Prometheus metrics |
| GET | `/health` | Health check |
| GET | `/docs` | API documentation |

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- created_at

### Sessions Table
- id (Primary Key)
- user_id (Foreign Key)
- name
- started_at
- ended_at

### Punches Table
- id (Primary Key)
- session_id (Foreign Key)
- punch_type (jab, cross, hook, uppercut)
- speed (mph)
- count
- timestamp
- notes

## Future Milestones (Stubbed)

The following features are stubbed with TODO comments for future implementation:

1. **ML Fatigue Detection** - Real PyTorch models for detecting fatigue
2. **Coach Mode** - Advanced coaching features
3. **Video Integration** - Video analysis capabilities
4. **Real Authentication** - JWT/OAuth integration
5. **Advanced Analytics** - More sophisticated metrics
6. **Real-time Updates** - WebSocket integration

## Development Notes

- All code follows clean, idiomatic patterns
- Comprehensive error handling and validation
- Production-ready Docker configuration
- Scalable architecture for future enhancements
- Full observability stack included
