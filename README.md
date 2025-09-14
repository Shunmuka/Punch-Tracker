# PunchTracker v3.1 - Enterprise Features Edition

A comprehensive boxing training platform with intelligent workout management, real-time analytics, advanced coaching features, and enterprise-grade capabilities.

## 🚀 What's New in v3.1 - Enterprise Features

### 📧 Smart Notifications System
- **Weekly progress reports**: Automated email and webhook notifications
- **User preferences**: Configurable notification settings per user
- **Multiple delivery channels**: Email (SMTP/SendGrid) and webhook support
- **Test notifications**: Send test reports to verify configuration
- **Scheduled delivery**: Configurable cron-based weekly reports

### 📊 Advanced Observability
- **Prometheus metrics**: Comprehensive application and business metrics
- **Grafana dashboards**: Real-time monitoring and visualization
- **Alert rules**: Automated alerts for errors, latency, and failures
- **Performance tracking**: Request rates, response times, and error rates
- **Database monitoring**: Query performance and slow query detection

### 📱 Device Integration
- **HMAC-signed webhooks**: Secure device data ingestion
- **API key management**: Per-user API keys with rate limiting
- **Real-time processing**: Auto-start workouts from device data
- **Rate limiting**: 60 requests per minute per API key
- **Request validation**: HMAC signature verification for security

### 🔐 Enhanced Authentication
- **Email verification**: Required for notifications with token-based verification
- **Password reset**: Secure token-based password reset flow
- **Account security**: Single-use, time-limited tokens
- **User onboarding**: Email verification during signup process

### 🏆 Coach Leaderboard
- **Weekly rankings**: Athlete performance leaderboard
- **Progress tracking**: 7-day punch trends with sparklines
- **Performance metrics**: Total punches, average speed, best day
- **Visual analytics**: Interactive charts and progress visualization

## 🚀 Previous Features (v3.0 - Smart Workouts)

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
- `POST /auth/verify` - Verify email address with token
- `POST /auth/forgot` - Send password reset email
- `POST /auth/reset` - Reset password with token

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

### Device Integration
- `POST /api/device/keys` - Create API key for device ingestion
- `GET /api/device/keys` - List user's API keys
- `DELETE /api/device/keys/{id}` - Delete API key
- `POST /api/device/ingest` - Ingest device data (HMAC-signed)

### Coach Features
- `POST /api/coach/invite` - Invite athlete
- `POST /api/coach/accept` - Accept coach invite
- `GET /api/coach/athletes` - List coach's athletes
- `GET /api/coach/leaderboard` - Get weekly leaderboard

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

### Email Configuration
- `SENDGRID_API_KEY` - SendGrid API key for email delivery
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password

### Notification Configuration
- `REPORT_SCHEDULE_CRON` - Weekly report schedule (default: Monday 8 AM)
- `SLACK_WEBHOOK_DEFAULT` - Default Slack webhook URL
- `DISCORD_WEBHOOK_DEFAULT` - Default Discord webhook URL

### Security Configuration
- `EMAIL_VERIFY_TOKEN_TTL_MIN` - Email verification token TTL (default: 60)
- `PASSWORD_RESET_TOKEN_TTL_MIN` - Password reset token TTL (default: 60)

### Device Integration Configuration
- `WEBHOOK_HMAC_HEADER` - HMAC signature header name (default: X-Signature)
- `WEBHOOK_DRIFT_SEC` - Allowed timestamp drift in seconds (default: 120)
- `RATE_LIMIT_PER_MIN` - API rate limit per minute (default: 60)

### Workout Configuration
- `INACTIVITY_MINUTES` - Auto-stop timeout (default: 3)
- `SEGMENT_ACTIVE_MIN_S` - Minimum active segment duration (default: 40)
- `SEGMENT_REST_MIN_S` - Minimum rest segment duration (default: 15)

### Optional Variables
- `FRONTEND_URL` - Frontend URL for email links (default: http://localhost:3000)
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
    /routes (auth, sessions, punches, analytics, coach, notifications, workouts, device, auth_flows, leaderboard)
    /services (notifications, device, auth_flows, leaderboard)
    /alembic (database migrations)
  /frontend (React app: pages, components, charts, tests, contexts)
    /src/contexts (AuthContext for user management)
    /src/components (Login, Dashboard, PunchLogger, CoachDashboard, RecordingChip, WorkoutSummary, NotificationsSettings, Leaderboard, EmailVerification, ForgotPassword, ResetPassword, DeviceIngestion)
  /infra (docker-compose.yml, prometheus.yml, grafana dashboards, alert_rules.yml)
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
- HMAC-signed device integration
- Rate limiting and API key management

### 📧 Smart Notifications
- Weekly progress reports
- Multiple delivery channels
- User-configurable preferences
- Test notification capabilities

### 📊 Enterprise Observability
- Prometheus metrics collection
- Grafana dashboards and visualization
- Automated alerting and monitoring
- Performance and error tracking

### 🏆 Advanced Coaching
- Weekly athlete leaderboards
- Progress tracking and analytics
- Visual performance trends
- Comprehensive athlete management

## Recent Bug Fixes & Improvements

### Timer & Analytics Fixes
- **Fixed Real-time Timer**: Resolved issue where workout timer was stuck at 00:00 and not updating in real-time
- **Enhanced Weekly Progress**: Added auto-refresh functionality and improved data accuracy
- **Improved Dashboard**: Added manual refresh button and better error handling
- **Debug Capabilities**: Added comprehensive logging and debugging tools for development

### Security & Performance
- **Enhanced Authentication**: Improved JWT token handling and user session management
- **Better Error Handling**: Added comprehensive error logging and user-friendly error messages
- **Performance Optimization**: Implemented Redis caching and database query optimization
- **Code Quality**: Added comprehensive linting and code quality checks

## Changelog

### v3.1.0 (Current) - Enterprise Features Edition
- ✅ Added Smart Notifications system with weekly reports
- ✅ Implemented Prometheus metrics and Grafana dashboards
- ✅ Added HMAC-signed device ingestion with API key management
- ✅ Created email verification and password reset flows
- ✅ Built weekly leaderboard for coaches with visual analytics
- ✅ Enhanced security with rate limiting and token management
- ✅ Added comprehensive observability and monitoring
- ✅ Implemented user-configurable notification preferences
- ✅ Fixed real-time timer functionality in workout recording
- ✅ Enhanced weekly progress tracking with auto-refresh
- ✅ Improved dashboard analytics with debug capabilities
- ✅ Added comprehensive error handling and logging

### v3.0.0 - Smart Workouts Edition
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