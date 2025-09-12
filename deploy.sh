#!/bin/bash

# PunchTracker MVP v2.0 - Deployment Script
# Usage: ./deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}
PROJECT_NAME="punchtracker"

echo "🚀 Deploying PunchTracker MVP v2.0 in $ENVIRONMENT mode..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is required. Please set it in your .env file."
    exit 1
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ POSTGRES_PASSWORD is required. Please set it in your .env file."
    exit 1
fi

echo "✅ Environment variables validated"

# Navigate to infra directory
cd infra

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Pull latest images (if any)
echo "📥 Pulling latest images..."
docker-compose pull

# Build images
echo "🔨 Building images..."
docker-compose build --no-cache

# Start services
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "🚀 Starting production services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    echo "🚀 Starting development services..."
    docker-compose up -d
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
docker-compose ps

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec -T backend alembic upgrade head

# Test API health
echo "🏥 Testing API health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
    exit 1
fi

# Test frontend
echo "🌐 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Grafana: http://localhost:3001 (admin/admin)"
echo "   Prometheus: http://localhost:9090"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f [service]"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart [service]"
echo "   Update: git pull && ./deploy.sh $ENVIRONMENT"
echo ""
echo "📊 Monitor your application:"
echo "   Check service status: docker-compose ps"
echo "   View resource usage: docker stats"
echo "   Access Grafana dashboards: http://localhost:3001"
echo ""
echo "Happy training! 🥊"
