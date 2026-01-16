#!/bin/bash
# Script to start both backend and frontend services

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Deepfake Detection Application${NC}"
echo ""

# Check if Docker Compose is available
if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    echo -e "${YELLOW}Using Docker Compose to start services...${NC}"
    if command -v docker-compose &> /dev/null; then
        docker-compose up --build
    else
        docker compose up --build
    fi
else
    echo -e "${YELLOW}Docker not found. Starting services manually...${NC}"
    echo ""
    
    # Start backend in background
    echo -e "${GREEN}Starting Backend (FastAPI) on port 8000...${NC}"
    cd backend
    python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start frontend
    echo -e "${GREEN}Starting Frontend (React) on port 3000...${NC}"
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Both services are starting!${NC}"
    echo -e "${BLUE}Backend: http://localhost:8000${NC}"
    echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
    echo ""
    echo "Press Ctrl+C to stop both services"
    
    # Wait for user interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    wait
fi

