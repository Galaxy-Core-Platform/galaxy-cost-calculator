#!/bin/bash

echo "=========================================="
echo "Galaxy Cost Calculator v2 - Segment Based"
echo "=========================================="
echo ""

# Function to kill processes on exit
cleanup() {
    echo -e "\n\nShutting down services..."
    kill $API_PID $FRONTEND_PID 2>/dev/null
    deactivate 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Generate initial configuration if needed
if [ ! -f "volume_config.yaml" ]; then
    echo "Generating initial volume configuration..."
    source venv/bin/activate
    python3 segment_operations_model.py --retail 1000000 --sme 100000 --corporate 10000
    deactivate
fi

# Start API server v2
echo "Starting API server v2 on port 5001..."
cd /Users/mifo/Desktop/galaxy-cost-calculator
source venv/bin/activate
python3 api_server_v2.py &
API_PID=$!
sleep 2

# Install js-yaml if needed
echo "Checking frontend dependencies..."
cd galaxy-cost-frontend
if ! grep -q "js-yaml" package.json; then
    npm install js-yaml @types/js-yaml --save
fi

# Start React frontend
echo "Starting React frontend on port 3000..."
npm start &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "Services are starting..."
echo ""
echo "API Server v2: http://localhost:5001"
echo "Frontend:      http://localhost:3000"
echo ""
echo "Features:"
echo "  • Customer segments (Retail, SME, Corporate)"
echo "  • YAML configuration editor"
echo "  • Operations volume tracking"
echo "  • Segment-based cost calculation"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================="

# Wait for both processes
wait