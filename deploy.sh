#!/bin/bash

# Aria Deployment Script
# This script helps deploy the Aria application to production

set -e

echo "🚀 Starting Aria deployment..."

# Check if required environment variables are set
required_vars=("OPENAI_API_KEY" "SECRET_KEY")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo "❌ Error: $var environment variable is not set"
        exit 1
    fi
done

# Build and start the application
echo "🏗️ Building and starting application..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for health check
echo "⏳ Waiting for application to be healthy..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    echo "Attempt $attempt/$max_attempts: Waiting for health check..."
    sleep 5
    ((attempt++))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Application failed to start properly"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Run database migrations if needed
echo "🗄️ Running database migrations..."
# Note: Add migration commands here if using a migration tool

echo "🎉 Deployment completed successfully!"
echo "🌐 Application is running at http://localhost:8000"
echo "📊 API documentation available at http://localhost:8000/docs"