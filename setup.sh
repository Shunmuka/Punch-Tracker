#!/bin/bash

# PunchTracker MVP Setup Script

echo "🥊 Setting up PunchTracker MVP..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ Created .env file. Please review and update as needed."
else
    echo "✅ .env file already exists."
fi

# Start services
echo "🚀 Starting all services with Docker Compose..."
cd infra
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Seed the database
echo "🌱 Seeding database with sample data..."
docker-compose exec backend python seed_data.py

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  Grafana: http://localhost:3001 (admin/admin)"
echo "  Prometheus: http://localhost:9090"
echo ""
echo "To stop all services:"
echo "  cd infra && docker-compose down"
echo ""
echo "To view logs:"
echo "  cd infra && docker-compose logs -f"
