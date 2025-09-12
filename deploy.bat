@echo off
REM PunchTracker MVP v2.0 - Deployment Script for Windows
REM Usage: deploy.bat [dev|prod]

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=dev

echo 🚀 Deploying PunchTracker MVP v2.0 in %ENVIRONMENT% mode...

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please copy env.example to .env and configure it.
    exit /b 1
)

echo ✅ Environment file found

REM Navigate to infra directory
cd infra

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Pull latest images (if any)
echo 📥 Pulling latest images...
docker-compose pull

REM Build images
echo 🔨 Building images...
docker-compose build --no-cache

REM Start services
if "%ENVIRONMENT%"=="prod" (
    echo 🚀 Starting production services...
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
) else (
    echo 🚀 Starting development services...
    docker-compose up -d
)

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak > nul

REM Check if services are running
echo 🔍 Checking service health...
docker-compose ps

REM Run database migrations
echo 🗄️ Running database migrations...
docker-compose exec -T backend alembic upgrade head

REM Test API health
echo 🏥 Testing API health...
curl -f http://localhost:8000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is healthy
) else (
    echo ❌ Backend API health check failed
    exit /b 1
)

REM Test frontend
echo 🌐 Testing frontend...
curl -f http://localhost:3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is healthy
) else (
    echo ❌ Frontend health check failed
    exit /b 1
)

echo.
echo 🎉 Deployment completed successfully!
echo.
echo 📱 Access your application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo    Grafana: http://localhost:3001 (admin/admin)
echo    Prometheus: http://localhost:9090
echo.
echo 🔧 Useful commands:
echo    View logs: docker-compose logs -f [service]
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart [service]
echo    Update: git pull && deploy.bat %ENVIRONMENT%
echo.
echo 📊 Monitor your application:
echo    Check service status: docker-compose ps
echo    View resource usage: docker stats
echo    Access Grafana dashboards: http://localhost:3001
echo.
echo Happy training! 🥊
