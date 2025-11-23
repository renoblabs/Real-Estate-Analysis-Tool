# Local Dev Box Deployment Guide

This guide shows you how to deploy REI OPS™ to your local dev box with automatic updates from GitHub.

---

## 🎯 Quick Start (5 Minutes)

### Option 1: Automated Script (Recommended)

```bash
# Clone the repo
git clone https://github.com/renoblabs/Real-Estate-Analysis-Tool.git
cd Real-Estate-Analysis-Tool

# Make script executable
chmod +x deploy-local.sh

# Run deployment
./deploy-local.sh
```

The script will:
1. ✅ Check Docker/Docker Compose
2. ✅ Clone/update repository
3. ✅ Check environment variables
4. ✅ Build and start containers
5. ✅ Verify application health

**Access your app:** http://localhost:3000

---

## 📋 Prerequisites

### Required Software:
- **Docker** (20.10+) - [Install Guide](https://docs.docker.com/get-docker/)
- **Docker Compose** (2.0+) - [Install Guide](https://docs.docker.com/compose/install/)
- **Git** - `sudo apt install git`

### Optional (for CI/CD):
- **webhook** - `sudo apt install webhook` (for GitHub auto-deploy)
- **SSH server** - `sudo apt install openssh-server` (for GitHub Actions)

---

## 🔧 Manual Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/renoblabs/Real-Estate-Analysis-Tool.git
cd Real-Estate-Analysis-Tool
```

### Step 2: Configure Environment

Create `.env.local`:

```bash
cp .env.local.example .env.local
nano .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

NODE_ENV=development
PORT=3000
```

### Step 3: Build and Run

```bash
# Start development server with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

---

## 🔄 Continuous Deployment Options

### Option A: GitHub Actions + SSH (Recommended)

Automatically deploy when you push to GitHub.

#### 1. Setup SSH Access

On your dev box:

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "github-actions"

# Display public key (add to ~/.ssh/authorized_keys)
cat ~/.ssh/id_ed25519.pub

# Get private key (add to GitHub Secrets)
cat ~/.ssh/id_ed25519
```

#### 2. Add GitHub Secrets

Go to: `Settings` → `Secrets and variables` → `Actions`

Add these secrets:
- `DEV_BOX_HOST` - Your dev box IP/hostname (e.g., `192.168.1.100`)
- `DEV_BOX_USER` - SSH username (e.g., `ubuntu`)
- `DEV_BOX_SSH_KEY` - Private SSH key (paste entire content)
- `DEV_BOX_PORT` - SSH port (default: `22`)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

#### 3. Enable Workflow

The workflow (`.github/workflows/deploy-to-dev-box.yml`) will automatically:
- ✅ Run tests and linting on every push
- ✅ Build the application
- ✅ Deploy to your dev box via SSH
- ✅ Restart Docker containers
- ✅ Run health checks

**Trigger:** Push to `main` or `develop` branch

---

### Option B: Local Webhook Server

Use a webhook server for instant GitHub → Dev Box updates.

#### 1. Install Webhook

```bash
sudo apt update
sudo apt install webhook
```

#### 2. Create Webhook Config

Create `/etc/webhook.conf`:

```json
[
  {
    "id": "rei-ops-deploy",
    "execute-command": "/home/YOUR_USER/rei-ops-app/git-webhook.sh",
    "command-working-directory": "/home/YOUR_USER/rei-ops-app",
    "response-message": "Deploying REI OPS...",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha256",
        "secret": "YOUR_SECRET_HERE",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
```

#### 3. Start Webhook Server

```bash
# Start webhook server
webhook -hooks /etc/webhook.conf -port 9000 -verbose

# Or as systemd service
sudo systemctl enable webhook
sudo systemctl start webhook
```

#### 4. Configure GitHub Webhook

In your GitHub repo:
1. Go to `Settings` → `Webhooks` → `Add webhook`
2. **Payload URL:** `http://YOUR_DEV_BOX_IP:9000/hooks/rei-ops-deploy`
3. **Content type:** `application/json`
4. **Secret:** Your secret from webhook.conf
5. **Events:** Just the push event

---

### Option C: Docker Watchtower (Auto-Update on Image Changes)

Automatically update when Docker image changes.

#### 1. Add Watchtower to docker-compose.dev.yml

```yaml
services:
  # ... existing services ...

  watchtower:
    image: containrrr/watchtower
    container_name: rei-ops-watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_POLL_INTERVAL=300  # Check every 5 minutes
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_INCLUDE_RESTARTING=true
    restart: unless-stopped
```

#### 2. Start Watchtower

```bash
docker-compose -f docker-compose.dev.yml up -d watchtower
```

Watchtower will automatically:
- Check for image updates every 5 minutes
- Pull new images
- Restart containers with new code
- Clean up old images

---

## 🔍 Monitoring & Logs

### View Application Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Just the app
docker-compose -f docker-compose.dev.yml logs -f rei-ops-app

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100
```

### Check Container Status

```bash
# List running containers
docker-compose -f docker-compose.dev.yml ps

# View resource usage
docker stats
```

### Application Health

```bash
# Check if app is running
curl http://localhost:3000

# Check API endpoint
curl http://localhost:3000/api/health
```

---

## 🐛 Troubleshooting

### App won't start

```bash
# Check logs for errors
docker-compose -f docker-compose.dev.yml logs

# Rebuild containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Port 3000 already in use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or use different port
docker-compose -f docker-compose.dev.yml up -d -p 3001:3000
```

### Supabase connection issues

```bash
# Verify environment variables are loaded
docker-compose -f docker-compose.dev.yml config

# Check .env.local file
cat .env.local

# Restart containers
docker-compose -f docker-compose.dev.yml restart
```

### GitHub Actions deployment fails

```bash
# SSH into your dev box and check:
1. SSH service is running: sudo systemctl status ssh
2. SSH key is in authorized_keys: cat ~/.ssh/authorized_keys
3. Port 22 is open: sudo ufw status
4. Docker is running: docker ps
```

---

## 📊 Deployment Comparison

| Method | Setup Time | Auto-Deploy | Complexity | Best For |
|--------|------------|-------------|------------|----------|
| **Manual Docker** | 5 min | ❌ | Low | Quick testing |
| **GitHub Actions + SSH** | 15 min | ✅ | Medium | Production-like workflow |
| **Local Webhook** | 10 min | ✅ | Medium | Local-first approach |
| **Watchtower** | 5 min | ✅ | Low | Set-and-forget updates |

**Recommended:** Start with GitHub Actions + SSH for best CI/CD experience.

---

## 🚀 Next Steps

After deployment:

1. **Setup Supabase Database**
   - Run SQL migrations from `/supabase/schema.sql`
   - Configure Row Level Security (RLS)

2. **Create Test User**
   ```bash
   # Access app at http://localhost:3000
   # Click "Sign Up" and create account
   ```

3. **Test Features**
   - Analyze a property
   - View portfolio
   - Compare deals
   - Export PDF

4. **Monitor Performance**
   - Check Docker stats: `docker stats`
   - View application logs
   - Test on mobile devices

---

## 📝 Common Commands

```bash
# Start
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose -f docker-compose.dev.yml down

# Restart
docker-compose -f docker-compose.dev.yml restart

# Rebuild
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Update code
git pull origin main
docker-compose -f docker-compose.dev.yml up -d --build

# Clean everything
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
```

---

## 🔒 Security Considerations

For production deployment on dev box:

1. **Firewall Configuration**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 3000  # App
   sudo ufw enable
   ```

2. **HTTPS with Let's Encrypt**
   - Use Nginx reverse proxy
   - Install Certbot
   - Configure SSL certificates

3. **Environment Security**
   - Never commit `.env.local` to git
   - Rotate Supabase keys regularly
   - Use strong SSH keys

4. **Regular Updates**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade

   # Update Docker
   sudo apt update && sudo apt install docker-ce docker-ce-cli containerd.io
   ```

---

## 💡 Tips & Best Practices

1. **Use separate .env for production**
   ```bash
   cp .env.local .env.production.local
   # Edit with production values
   docker-compose -f docker-compose.dev.yml --env-file .env.production.local up -d
   ```

2. **Backup your data regularly**
   ```bash
   # Backup Supabase database
   # (Use Supabase dashboard or pg_dump)
   ```

3. **Monitor disk space**
   ```bash
   # Clean up Docker
   docker system prune -a --volumes
   ```

4. **Set up log rotation**
   ```bash
   # Configure Docker logging in docker-compose
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

---

## 🆘 Support

**Issues?** Check:
- [GitHub Issues](https://github.com/renoblabs/Real-Estate-Analysis-Tool/issues)
- [Docker Docs](https://docs.docker.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

**Need help?** Open an issue with:
- Docker version: `docker --version`
- Docker Compose version: `docker-compose --version`
- OS version: `lsb_release -a`
- Error logs: `docker-compose logs`
