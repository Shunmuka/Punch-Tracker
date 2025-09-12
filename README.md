# PunchTracker MVP

A minimal vertical-slice MVP for tracking boxing punch sessions with basic analytics.

## Tech Stack

- **Backend**: FastAPI (Python), REST APIs
- **Frontend**: React, Recharts (basic charts)
- **Database**: PostgreSQL + Redis (for caching/session)
- **Infra**: Docker, Docker Compose, GitHub Actions for CI
- **Observability**: Basic Prometheus metrics endpoint, simple Grafana dashboard placeholder
- **ML/Analytics**: PyTorch service skeleton + placeholder model
- **Testing**: PyTest (backend), Jest (frontend)

## Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repo-url>
   cd PunchTracker
   cp .env.example .env
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Seed initial data**:
   ```bash
   docker-compose exec backend python seed_data.py
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Grafana: http://localhost:3001 (admin/admin)
   - Prometheus: http://localhost:9090

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Setup
```bash
# Create database
docker-compose exec postgres createdb -U postgres punchtracker

# Run migrations (if any)
docker-compose exec backend alembic upgrade head
```

## API Endpoints

- `POST /api/punches` - Log punch data
- `GET /api/analytics/:sessionId` - Get session analytics
- `GET /metrics` - Prometheus metrics

## Testing

```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

## Project Structure

```
/punchtracker
  /backend (FastAPI app: routes, models, services, tests)
  /frontend (React app: pages, components, charts, tests)
  /infra (docker-compose.yml, prometheus.yml, grafana dashboards)
  .env.example
  README.md
  .github/workflows/ci.yml
```
