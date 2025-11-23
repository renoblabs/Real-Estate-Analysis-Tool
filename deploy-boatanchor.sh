#!/bin/bash
# REI OPS™ Deployment Script for boatanchor
# Run this on mark@boatanchor

set -e

echo "🚀 Deploying REI OPS™ to boatanchor..."
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and back in, then run this script again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed."
fi

echo "✅ Docker and Docker Compose are ready"
echo ""

# Clone or update repository
REPO_DIR="$HOME/rei-ops-app"
if [ -d "$REPO_DIR" ]; then
    echo "📂 Repository exists. Updating..."
    cd "$REPO_DIR"
    git fetch origin
    git checkout main
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/renoblabs/Real-Estate-Analysis-Tool.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

echo "✅ Repository ready"
echo ""

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local file..."
    cat > .env.local << 'EOF'
# Supabase Configuration
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Service role key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
EOF
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your Supabase credentials"
    echo "   Run: nano $REPO_DIR/.env.local"
    echo ""
    echo "Press Enter when you've updated .env.local (or press Ctrl+C to exit and update later)"
    read -r
fi

echo "✅ Environment configured"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Build and start
echo "🐳 Building and starting containers..."
docker-compose -f docker-compose.dev.yml up -d --build

echo ""
echo "⏳ Waiting for application to start..."
sleep 15

# Check if running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo ""
    echo "✅ ========================================="
    echo "✅ REI OPS™ is now running!"
    echo "✅ ========================================="
    echo ""
    echo "📍 Access your app at:"
    echo "   🌐 http://boatanchor:3000"
    echo "   🌐 http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    echo "📊 View logs:"
    echo "   docker-compose -f docker-compose.dev.yml logs -f"
    echo ""
    echo "🛑 Stop the app:"
    echo "   docker-compose -f docker-compose.dev.yml down"
    echo ""
    echo "🔄 Update and restart:"
    echo "   git pull origin main && docker-compose -f docker-compose.dev.yml up -d --build"
    echo ""
else
    echo ""
    echo "❌ Something went wrong. Check logs:"
    echo "   docker-compose -f docker-compose.dev.yml logs"
fi
