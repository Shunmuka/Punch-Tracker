# PunchTracker - Minimal Boxing Analytics

A minimal, dark-themed boxing analytics platform built with Next.js and FastAPI.

## Features

- **Dark Theme**: Black/gray background with neon cyan accents
- **Mobile-First**: Responsive design optimized for mobile devices
- **KPI Dashboard**: Punch count, average speed, and session tracking
- **Time-Series Chart**: Visual representation of speed over time
- **Real-time Data**: Live updates from PostgreSQL database

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Recharts
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Infrastructure**: Docker Compose

## Quick Start

1. **Clone and start services**:
   ```bash
   git clone https://github.com/Shunmuka/Punch-Tracker.git
   cd Punch-Tracker
   docker-compose up
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

3. **Load sample data**:
   - Click "Load Sample Data" button on the homepage
   - This creates a session with 50 random punches

## API Endpoints

- `POST /sessions` - Create a new session
- `POST /sessions/{id}/punches` - Upload punches to a session
- `GET /sessions/{id}/summary` - Get session summary
- `GET /sessions` - Get all sessions
- `POST /seed` - Seed database with sample data

## Database Schema

- **sessions**: id, created_at
- **punches**: id, session_id (FK), speed_mps

## Development

```bash
# Backend only
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend only
cd frontend
npm install
npm run dev
```

## Screenshots

*Screenshots will be added after implementation*

- Dark theme home dashboard
- KPI cards with neon cyan accents
- Speed over time chart
- Mobile-responsive design
