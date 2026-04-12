#!/bin/bash

# Leader Academy - Start All Services
# This script starts the API Gateway and all 10 Microservices

echo "🚀 Starting Leader Academy Platform..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory
mkdir -p logs

# Function to start a service
start_service() {
  local service_name=$1
  local service_file=$2
  local port=$3
  
  echo -e "${YELLOW}Starting $service_name on port $port...${NC}"
  node "$service_file" > "logs/${service_name}.log" 2>&1 &
  echo $! > "logs/${service_name}.pid"
  sleep 1
  echo -e "${GREEN}✅ $service_name started (PID: $!)${NC}"
}

# Start API Gateway
echo -e "${YELLOW}Starting API Gateway on port 3000...${NC}"
node gateway-v2.js > logs/gateway.log 2>&1 &
echo $! > logs/gateway.pid
sleep 2
echo -e "${GREEN}✅ API Gateway started${NC}"

# Start all Microservices
start_service "Courses Service" "services/courses-service.js" "3001"
start_service "Learning Support Service" "services/learning-support-service.js" "3002"
start_service "Teacher Tools Service" "services/teacher-tools-service.js" "3003"
start_service "Showcase Service" "services/showcase-service.js" "3004"
start_service "Talent Radar Service" "services/talent-radar-service.js" "3005"
start_service "Jobs Service" "services/jobs-service.js" "3006"
start_service "Realtime Service" "services/realtime-service.js" "3007"
start_service "Marketplace Service" "services/marketplace-service.js" "3009"
start_service "Gamification Service" "services/gamification-service.js" "3010"
start_service "Analytics Service" "services/analytics-service.js" "3011"

# Start Dashboard
echo -e "${YELLOW}Starting Dashboard on port 8080...${NC}"
python3 -m http.server 8080 > logs/dashboard.log 2>&1 &
echo $! > logs/dashboard.pid
sleep 1
echo -e "${GREEN}✅ Dashboard started${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo "=========================================="
echo ""
echo "📊 Service Status:"
echo "  • API Gateway: http://localhost:3000"
echo "  • Courses Service: http://localhost:3001"
echo "  • Learning Support: http://localhost:3002"
echo "  • Teacher Tools: http://localhost:3003"
echo "  • Showcase: http://localhost:3004"
echo "  • Talent Radar: http://localhost:3005"
echo "  • Jobs Service: http://localhost:3006"
echo "  • Realtime: http://localhost:3007"
echo "  • Marketplace: http://localhost:3009"
echo "  • Gamification: http://localhost:3010"
echo "  • Analytics: http://localhost:3011"
echo "  • Dashboard: http://localhost:8080"
echo ""
echo "📁 Log Files:"
echo "  • logs/gateway.log"
echo "  • logs/*-service.log"
echo "  • logs/dashboard.log"
echo ""
echo "🛑 To stop all services, run: ./stop-all-services.sh"
echo ""
