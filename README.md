# PunchTracker MVP v2.0

A comprehensive boxing training platform with real authentication, analytics, and coach features.

## 🚀 What's New in v2.0

### 🔐 Real Authentication & Roles
- JWT-based authentication with secure password hashing
- User roles: Athlete and Coach
- Protected routes and API endpoints
- Session management with automatic token refresh

### 📊 Enhanced Analytics & Trends
- Weekly progress reports with email/Slack integration
- Comparative analytics (this week vs last week)
- 4-week trend sparklines
- Fatigue detection (beta)
- Streak tracking

### 👨‍🏫 Coach Mode
- Coach-athlete relationship management
- Athlete progress monitoring
- Read-only dashboard access
- Invite system for athletes

### 📧 Smart Notifications
- Weekly progress reports via email
- Slack/Discord webhook integration
- Configurable notification preferences
- Automated scheduling with cron jobs

## Tech Stack

- **Backend**: FastAPI (Python), REST APIs, JWT Authentication
- **Frontend**: React, Recharts, Tailwind CSS, React Router
- **Database**: PostgreSQL + Redis (for caching/session)
- **Infra**: Docker, Docker Compose, GitHub Actions for CI
- **Observability**: Prometheus metrics, Grafana dashboards
- **ML/Analytics**: PyTorch service skeleton + placeholder model
- **Notifications**: SendGrid, Slack/Discord webhooks
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

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate user
- `GET /auth/me` - Get current user profile

### Session Management
- `GET /api/sessions` - List user sessions (paginated)
- `POST /api/sessions` - Create new session
- `PATCH /api/sessions/{id}` - Update session
- `GET /api/sessions/{id}` - Get specific session

### Punch Logging
- `POST /api/punches` - Log punch data
- `GET /api/analytics/{session_id}` - Get session analytics

### Enhanced Analytics
- `GET /api/analytics/weekly` - Get weekly progress and trends
- `GET /api/notifications/prefs` - Get notification preferences
- `PATCH /api/notifications/prefs` - Update notification preferences
- `POST /api/notifications/test` - Send test notification

### Coach Features
- `POST /api/coach/invite` - Invite athlete
- `POST /api/coach/accept` - Accept coach invite
- `GET /api/coach/athletes` - List coach's athletes

### System
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## User Roles

### Athlete
- Log punches and create sessions
- View personal analytics and trends
- Receive weekly progress reports
- Accept coach invitations

### Coach
- All athlete features
- Invite and manage athletes
- View athlete progress dashboards
- Monitor athlete performance

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `POSTGRES_*` - Database connection
- `REDIS_*` - Redis cache configuration
- `JWT_SECRET` - JWT token signing key

### Optional Variables
- `SENDGRID_API_KEY` - Email service for notifications
- `SLACK_WEBHOOK_DEFAULT` - Default Slack webhook URL
- `DISCORD_WEBHOOK_DEFAULT` - Default Discord webhook URL
- `REPORT_SCHEDULE_CRON` - Weekly report schedule (default: Monday 8 AM)

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
  /backend (FastAPI app: routes, models, services, tests, auth, notifications)
    /routes (auth, sessions, punches, analytics, coach, notifications)
    /alembic (database migrations)
  /frontend (React app: pages, components, charts, tests, contexts)
    /src/contexts (AuthContext for user management)
    /src/components (Login, Dashboard, PunchLogger, CoachDashboard)
  /infra (docker-compose.yml, prometheus.yml, grafana dashboards)
  .env.example
  README.md
  .github/workflows/ci.yml
```

## Changelog

### v2.0.0 (Current)
- Added real authentication with JWT
- Implemented user roles (Athlete/Coach)
- Added weekly progress reports
- Created coach dashboard
- Enhanced analytics with trends
- Added notification system
- Improved session management

### v1.0.0 (Initial)
- Basic punch logging
- Simple analytics dashboard
- Mock authentication
- Docker setup
