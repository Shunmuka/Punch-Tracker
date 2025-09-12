@echo off
REM PunchTracker MVP Setup Script for Windows

echo 🥊 Setting up PunchTracker MVP...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Copy environment file
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ Created .env file. Please review and update as needed.
) else (
    echo ✅ .env file already exists.
)

REM Start services
echo 🚀 Starting all services with Docker Compose...
cd infra
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Seed the database
echo 🌱 Seeding database with sample data...
docker-compose exec backend python seed_data.py

echo.
echo 🎉 Setup complete!
echo.
echo Access the application:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Grafana: http://localhost:3001 (admin/admin)
echo   Prometheus: http://localhost:9090
echo.
echo To stop all services:
echo   cd infra && docker-compose down
echo.
echo To view logs:
echo   cd infra && docker-compose logs -f
echo.
pause
