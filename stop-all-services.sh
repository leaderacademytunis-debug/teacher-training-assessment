#!/bin/bash

# Leader Academy - Stop All Services

echo "🛑 Stopping Leader Academy Platform..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop a service
stop_service() {
  local service_name=$1
  local pid_file=$2
  
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      echo -e "${GREEN}✅ $service_name stopped (PID: $pid)${NC}"
      rm "$pid_file"
    else
      echo -e "${YELLOW}⚠️ $service_name not running${NC}"
    fi
  fi
}

# Stop all services
stop_service "API Gateway" "logs/gateway.pid"
stop_service "Courses Service" "logs/Courses Service.pid"
stop_service "Learning Support Service" "logs/Learning Support Service.pid"
stop_service "Teacher Tools Service" "logs/Teacher Tools Service.pid"
stop_service "Showcase Service" "logs/Showcase Service.pid"
stop_service "Talent Radar Service" "logs/Talent Radar Service.pid"
stop_service "Jobs Service" "logs/Jobs Service.pid"
stop_service "Realtime Service" "logs/Realtime Service.pid"
stop_service "Marketplace Service" "logs/Marketplace Service.pid"
stop_service "Gamification Service" "logs/Gamification Service.pid"
stop_service "Analytics Service" "logs/Analytics Service.pid"
stop_service "Dashboard" "logs/dashboard.pid"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ All services stopped${NC}"
echo "=========================================="
