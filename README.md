# PunchTracker v3.0 - Smart Workouts Edition

A comprehensive boxing training platform with intelligent workout management, real-time analytics, and advanced coaching features.

## 🚀 What's New in v3.0 - Smart Workouts

### 🥊 Smart Workout System
- **Auto-start workouts**: Automatically creates workout when first punch is logged
- **Auto-stop workouts**: Automatically stops workout after configurable inactivity period
- **Workout templates**: Pre-defined structures for different training types
  - **Sparring**: 6 rounds × 3 minutes + 1 minute rest
  - **Heavy Bag**: 8 rounds × 3 minutes + 1 minute rest  
  - **Speed Bag**: 10 rounds × 2 minutes + 30 seconds rest
  - **Conditioning**: 4 rounds × 5 minutes + 2 minutes rest
  - **Free Training**: No structure, just log punches
- **Planned segments**: Templates create structured round/rest periods with target durations
- **Auto-segmentation**: Intelligently detects active/rest periods from punch patterns
- **Workout summaries**: Comprehensive post-workout analysis with round-by-round breakdown

### 📊 Enhanced Analytics & Real-time Features
- **Live recording indicator**: Visual workout status in responsive navbar
- **Real-time elapsed time**: Live workout duration tracking
- **Interactive charts**: Punch distribution, speed trends, time-based analytics
- **Performance metrics**: Average speed, total punches, duration tracking
- **Responsive design**: Optimized for desktop, tablet, mobile, and split-screen viewing

## 🔐 Authentication & User Management
- JWT-based authentication with secure password hashing
- User roles: Athlete and Coach with role-based access control
- Protected routes and API endpoints
- Session management with automatic token refresh
- Secure user registration and login system

## 👨‍🏫 Coach Dashboard
- Athlete management and progress monitoring
- Performance analytics overview
- Role-based access control
- Comprehensive athlete tracking

## 📧 Smart Notifications
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
   cp env.example .env
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

4. **Seed initial data** (optional):
   ```bash
   docker-compose exec backend python seed_data.py
   ```

5. **Access the application**:
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

# Run migrations
docker-compose exec backend alembic upgrade head
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate user
- `GET /auth/me` - Get current user profile

### Smart Workouts
- `POST /workouts/start` - Start new workout (with optional template)
- `POST /workouts/stop` - Stop active workout
- `GET /workouts/active` - Get currently active workout
- `GET /workouts/{id}/summary` - Get detailed workout summary
- `GET /workouts/templates` - Get available workout templates

### Punch Logging
- `POST /api/punches` - Log punch data (auto-starts workout if none active)
- `GET /api/analytics/{session_id}` - Get session analytics

### Analytics & Reporting
- `GET /api/analytics/weekly` - Get weekly progress and trends
- `GET /api/analytics/enhanced` - Get enhanced analytics with caching

### Coach Features
- `POST /api/coach/invite` - Invite athlete
- `POST /api/coach/accept` - Accept coach invite
- `GET /api/coach/athletes` - List coach's athletes

### Notifications
- `GET /api/notifications/prefs` - Get notification preferences
- `PATCH /api/notifications/prefs` - Update notification preferences
- `POST /api/notifications/test` - Send test notification

### System
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## User Roles

### Athlete
- Log punches and create sessions
- Start/stop structured workouts with templates
- View personal analytics and trends
- Receive weekly progress reports
- Accept coach invitations
- Auto-start workouts on first punch

### Coach
- All athlete features
- Invite and manage athletes
- View athlete progress dashboards
- Monitor athlete performance
- Access coach-specific analytics

## Workout Templates

### Sparring
- **Structure**: 6 rounds × 3 minutes + 1 minute rest
- **Total Duration**: ~24 minutes
- **Best for**: Technical sparring sessions

### Heavy Bag
- **Structure**: 8 rounds × 3 minutes + 1 minute rest
- **Total Duration**: ~32 minutes
- **Best for**: Power and endurance training

### Speed Bag
- **Structure**: 10 rounds × 2 minutes + 30 seconds rest
- **Total Duration**: ~25 minutes
- **Best for**: Speed and rhythm training

### Conditioning
- **Structure**: 4 rounds × 5 minutes + 2 minutes rest
- **Total Duration**: ~28 minutes
- **Best for**: High-intensity conditioning

### Free Training
- **Structure**: No predefined structure
- **Duration**: Until manually stopped
- **Best for**: Open training sessions

## Environment Variables

See `env.example` for all available configuration options.

### Required Variables
- `POSTGRES_*` - Database connection
- `REDIS_*` - Redis cache configuration
- `JWT_SECRET` - JWT token signing key

### Workout Configuration
- `INACTIVITY_MINUTES` - Auto-stop timeout (default: 3)
- `SEGMENT_ACTIVE_MIN_S` - Minimum active segment duration (default: 40)
- `SEGMENT_REST_MIN_S` - Minimum rest segment duration (default: 15)

### Optional Variables
- `SENDGRID_API_KEY` - Email service for notifications
- `SLACK_WEBHOOK_DEFAULT` - Default Slack webhook URL
- `DISCORD_WEBHOOK_DEFAULT` - Default Discord webhook URL
- `REPORT_SCHEDULE_CRON` - Weekly report schedule (default: Monday 8 AM)
- `USE_SQLITE_FALLBACK` - Use SQLite when PostgreSQL unavailable

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
    /routes (auth, sessions, punches, analytics, coach, notifications, workouts)
    /alembic (database migrations)
  /frontend (React app: pages, components, charts, tests, contexts)
    /src/contexts (AuthContext for user management)
    /src/components (Login, Dashboard, PunchLogger, CoachDashboard, RecordingChip, WorkoutSummary)
  /infra (docker-compose.yml, prometheus.yml, grafana dashboards)
  env.example
  README.md
  .github/workflows/ci.yml
```

## Key Features

### 🥊 Smart Workout Management
- Auto-start/stop functionality
- Predefined workout templates
- Real-time workout tracking
- Comprehensive workout summaries

### 📊 Advanced Analytics
- Real-time performance tracking
- Historical data analysis
- Interactive visualizations
- Performance trend analysis

### 🎯 User Experience
- Responsive design for all devices
- Split-screen optimization
- Intuitive navigation
- Real-time status indicators

### 🔒 Security & Reliability
- JWT-based authentication
- Role-based access control
- Data validation and sanitization
- Error handling and recovery

## Changelog

### v3.0.0 (Current) - Smart Workouts Edition
- ✅ Added Smart Workout system with auto-start/stop
- ✅ Implemented workout templates (Sparring, Heavy Bag, Speed Bag, Conditioning)
- ✅ Added planned segments with target durations
- ✅ Created auto-segmentation for active/rest detection
- ✅ Built comprehensive workout summaries
- ✅ Enhanced responsive design for split-screen viewing
- ✅ Added real-time workout status indicators
- ✅ Improved navbar with template selection
- ✅ Added workout summary page with detailed analytics

### v2.0.0 - Authentication & Analytics
- Added real authentication with JWT
- Implemented user roles (Athlete/Coach)
- Added weekly progress reports
- Created coach dashboard
- Enhanced analytics with trends
- Added notification system
- Improved session management

### v1.0.0 - Initial Release
- Basic punch logging
- Simple analytics dashboard
- Mock authentication
- Docker setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.