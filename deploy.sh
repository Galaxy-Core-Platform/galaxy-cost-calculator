#!/bin/bash

echo "=========================================="
echo "Galaxy Cost Calculator - Deployment Script"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    echo "Please install docker-compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "Error: Failed to build Docker image"
    exit 1
fi

# Start the services
echo "Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "Error: Failed to start services"
    exit 1
fi

# Wait for health check
echo "Waiting for service to be healthy..."
sleep 5

# Check health
curl -s http://localhost:5000/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Deployment successful!"
    echo ""
    echo "Galaxy Cost Calculator is running at:"
    echo "  http://localhost:5000"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker-compose down"
    echo "=========================================="
else
    echo "Warning: Service may not be fully ready yet"
    echo "Check logs with: docker-compose logs"
fi