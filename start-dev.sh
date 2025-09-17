#!/bin/bash

# Development Startup Script for IT Helpdesk System
echo "🚀 Starting IT Helpdesk System in Development Mode"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example"
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before continuing."
    exit 1
fi

echo "🐳 Starting services with Docker Compose..."

# Start the services
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Services started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/api/docs"
