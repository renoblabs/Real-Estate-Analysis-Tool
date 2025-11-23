#!/bin/bash

# REI OPS™ - Local Dev Box Deployment Script
# This script sets up auto-deployment from GitHub to your local dev box

set -e

echo "🚀 REI OPS™ Local Deployment Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="${APP_DIR:-$HOME/rei-ops-app}"
REPO_URL="https://github.com/renoblabs/Real-Estate-Analysis-Tool.git"
BRANCH="${BRANCH:-main}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Clone or update repository
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}📂 Repository exists. Updating...${NC}"
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
    git pull origin $BRANCH
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone -b $BRANCH $REPO_URL $APP_DIR
    cd "$APP_DIR"
fi

echo -e "${GREEN}✓ Repository is up to date${NC}"
echo ""

# Check for .env file
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  No .env.local file found. Creating template...${NC}"
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application
NODE_ENV=development
PORT=3000
EOF
    echo -e "${RED}❌ Please edit .env.local with your Supabase credentials${NC}"
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✓ Environment file exists${NC}"
echo ""

# Build and start containers
echo -e "${YELLOW}🐳 Building and starting Docker containers...${NC}"
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo -e "${GREEN}✓ Containers are running${NC}"
echo ""

# Wait for app to be ready
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 10

# Health check
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application is running!${NC}"
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "Access your app at:"
    echo "  🌐 http://localhost:3000"
    echo ""
    echo "View logs:"
    echo "  docker-compose -f docker-compose.dev.yml logs -f"
    echo ""
    echo "Stop containers:"
    echo "  docker-compose -f docker-compose.dev.yml down"
else
    echo -e "${RED}❌ Application failed to start${NC}"
    echo "Check logs with:"
    echo "  docker-compose -f docker-compose.dev.yml logs"
    exit 1
fi

# Setup git hook for auto-deployment (optional)
echo ""
read -p "Setup auto-deployment on git push? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📝 Creating git webhook script...${NC}"

    cat > "$APP_DIR/git-webhook.sh" << 'EOF'
#!/bin/bash
# Auto-deployment webhook script
cd "$(dirname "$0")"
git pull origin main
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
EOF

    chmod +x "$APP_DIR/git-webhook.sh"

    echo -e "${GREEN}✓ Webhook script created at: $APP_DIR/git-webhook.sh${NC}"
    echo ""
    echo "To enable GitHub webhook:"
    echo "1. Install webhook server: sudo apt install webhook"
    echo "2. Configure webhook to call git-webhook.sh"
    echo "3. Add webhook URL to GitHub repo settings"
    echo ""
fi

echo "✨ All done! Happy coding! ✨"
