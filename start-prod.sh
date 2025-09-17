#!/bin/bash

# Production Startup Script for IT Helpdesk System
echo "🚀 Starting IT Helpdesk System in Production Mode"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ No .env file found. Please create one with production configuration."
    exit 1
fi

# Check required environment variables
required_vars=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_SECRET" "EMAIL_HOST" "EMAIL_USER" "EMAIL_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set."
        exit 1
    fi
done

echo "🐳 Starting production services..."

# Start the services
docker-compose up -d --build

echo "✅ Production services started successfully!"
echo "🌐 Application: http://localhost (if using reverse proxy)"
echo "🔗 Backend API: http://localhost:5000"

# Show running containers
echo "📊 Running containers:"
docker-compose ps
