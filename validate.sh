#!/bin/bash

# System Validation Script
echo "🔍 IT Helpdesk System - Validation Check"
echo "========================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check for required tools
echo "📋 Checking Prerequisites..."

# Check Docker
if command -v docker &> /dev/null; then
    print_status 0 "Docker is installed"
    if docker info &> /dev/null; then
        print_status 0 "Docker is running"
    else
        print_status 1 "Docker is not running"
        DOCKER_RUNNING=false
    fi
else
    print_status 1 "Docker is not installed"
    DOCKER_RUNNING=false
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    print_status 0 "Docker Compose is installed"
else
    print_status 1 "Docker Compose is not installed"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js is installed ($NODE_VERSION)"
else
    print_status 1 "Node.js is not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm is installed ($NPM_VERSION)"
else
    print_status 1 "npm is not installed"
fi

echo ""
echo "📁 Checking Project Structure..."

# Check critical files
critical_files=(
    ".env.example"
    "docker-compose.yml"
    "docker-compose.dev.yml"
    "backend/package.json"
    "frontend/package.json"
    "backend/app.js"
    "backend/server.js"
    "frontend/src/App.js"
    "frontend/src/index.js"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file exists"
    else
        print_status 1 "$file is missing"
    fi
done

echo ""
echo "📦 Checking Package Dependencies..."

# Check backend dependencies
if [ -f "backend/node_modules/package.json" ] || [ -d "backend/node_modules" ]; then
    print_status 0 "Backend dependencies installed"
else
    print_warning "Backend dependencies not installed - run: cd backend && npm install"
fi

# Check frontend dependencies
if [ -f "frontend/node_modules/package.json" ] || [ -d "frontend/node_modules" ]; then
    print_status 0 "Frontend dependencies installed"
else
    print_warning "Frontend dependencies not installed - run: cd frontend && npm install"
fi

echo ""
echo "⚙️  Checking Configuration..."

# Check .env file
if [ -f ".env" ]; then
    print_status 0 ".env file exists"
    
    # Check for critical env variables
    if grep -q "JWT_SECRET=" .env && [ "$(grep '^JWT_SECRET=' .env | cut -d'=' -f2)" != "your_super_secret_jwt_key_here_at_least_32_characters_long_for_security_purposes" ]; then
        print_status 0 "JWT_SECRET is configured"
    else
        print_warning "JWT_SECRET needs to be updated in .env"
    fi
    
    if grep -q "DB_PASSWORD=" .env && [ "$(grep '^DB_PASSWORD=' .env | cut -d'=' -f2)" != "helpdesk_password" ]; then
        print_status 0 "Database password is configured"
    else
        print_warning "Consider changing default database password in .env"
    fi
else
    print_warning ".env file not found - copy from .env.example"
fi

echo ""
echo "🧪 Running Quick Tests..."

# Test backend syntax
if [ -d "backend/node_modules" ]; then
    cd backend
    if npm run test --silent 2>/dev/null; then
        print_status 0 "Backend tests pass"
    else
        print_warning "Backend tests have issues"
    fi
    cd ..
else
    print_warning "Skipping backend tests - dependencies not installed"
fi

# Test frontend syntax
if [ -d "frontend/node_modules" ]; then
    cd frontend
    if timeout 30s npm test -- --run --passWithNoTests --silent 2>/dev/null; then
        print_status 0 "Frontend tests pass"
    else
        print_warning "Frontend tests have issues or timed out"
    fi
    cd ..
else
    print_warning "Skipping frontend tests - dependencies not installed"
fi

echo ""
echo "📋 Validation Summary"
echo "===================="

if [ -f ".env" ] && [ -d "backend/node_modules" ] && [ -d "frontend/node_modules" ]; then
    print_status 0 "System appears ready for development"
    echo ""
    print_info "To start the system:"
    echo "  ./start-dev.sh"
    echo "  OR"
    echo "  docker-compose -f docker-compose.dev.yml up --build"
else
    print_warning "System needs setup. Please:"
    if [ ! -f ".env" ]; then
        echo "  1. Copy .env.example to .env and configure"
    fi
    if [ ! -d "backend/node_modules" ]; then
        echo "  2. Install backend dependencies: cd backend && npm install"
    fi
    if [ ! -d "frontend/node_modules" ]; then
        echo "  3. Install frontend dependencies: cd frontend && npm install"
    fi
fi

echo ""
print_info "For detailed setup instructions, see DEVELOPMENT.md"
