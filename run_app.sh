#!/bin/bash

echo "=========================================="
echo "Galaxy Cost Calculator"
echo "=========================================="
echo ""

# Function to kill processes on exit
cleanup() {
    echo -e "\n\nShutting down services..."
    kill $API_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start API server
echo "Starting API server on port 5000..."
cd /Users/mifo/Desktop/galaxy-cost-calculator
source venv/bin/activate
python3 api_server.py &
API_PID=$!
sleep 2

# Start React frontend
echo "Starting React frontend on port 3000..."
cd galaxy-cost-frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "Services are starting..."
echo ""
echo "API Server: http://localhost:5000"
echo "Frontend:   http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================="

# Wait for both processes
wait