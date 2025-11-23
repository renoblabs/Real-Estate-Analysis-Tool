# 🐳 Deploy REI OPS™ to Coolify

Complete guide to deploy REI OPS™ on your own server using Coolify.

---

## Prerequisites

- ✅ Linux server with Coolify installed
- ✅ Server accessible via SSH
- ✅ Domain `re.therink.io` (we'll point it to your server)
- ✅ Supabase account (or self-hosted Supabase)

---

## Part 1: Set Up Supabase (5 minutes)

You can use **hosted Supabase** (easiest) or **self-host** (more control).

### Option A: Hosted Supabase (Recommended)

1. Go to https://supabase.com → Sign in
2. Click **New Project**
3. Fill in:
   - Name: `rei-ops-production`
   - Database Password: (generate strong one)
   - Region: Closest to your server
4. Click **Create new project** (takes ~2 min)

5. Once ready, go to **SQL Editor**
6. Click **New Query**
7. Copy entire content from `supabase/schema.sql`
8. Paste and click **Run**
9. Should see "Success. No rows returned"

10. Go to **Settings** → **API**
11. **Copy these values** (you'll need them):
    ```
    Project URL: https://xxxxx.supabase.co
    anon public: eyJhbGc...
    service_role: eyJhbGc... (click Reveal)
    ```

### Option B: Self-Host Supabase on Coolify

If you want to self-host Supabase on the same server:

1. In Coolify, click **+ New Resource** → **Database**
2. Select **Supabase**
3. Configure and deploy
4. Once running, exec into container and run schema.sql
5. Get credentials from Coolify environment variables

---

## Part 2: Deploy to Coolify (10 minutes)

### Step 1: Create New Application

1. Open Coolify dashboard (your server's Coolify UI)
2. Click **+ New Resource** → **Application**
3. Select **Public Repository**

### Step 2: Configure Git Repository

**Repository Details:**
- Git Repository URL: `https://github.com/renoblabs/Real-Estate-Analysis-Tool.git`
- Branch: `claude/build-rei-ops-platform-012C2QP91U6WCU3D9Tv4EN2y`
- Build Pack: **Dockerfile**

### Step 3: Configure Build Settings

In the application settings:

**General:**
- Name: `rei-ops`
- Description: Canadian Real Estate Analysis Platform

**Build:**
- Build Pack: **Dockerfile** (auto-detected)
- Dockerfile Location: `/Dockerfile`
- Port: `3000`

**Domain:**
- Add domain: `re.therink.io`
- Enable SSL: ✅ (Coolify auto-generates Let's Encrypt cert)

### Step 4: Add Environment Variables

Click **Environment Variables** tab and add:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration (Required)
NEXT_PUBLIC_APP_URL=https://re.therink.io
NEXT_PUBLIC_APP_NAME=REI OPS™

# Node Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**Important:**
- Make sure to mark all `NEXT_PUBLIC_*` variables as **Build Time** variables
- `SUPABASE_SERVICE_ROLE_KEY` should be **Runtime** only

### Step 5: Deploy

1. Click **Deploy** button
2. Watch the build logs
3. Build should take ~3-5 minutes
4. Once complete, Coolify will start the container

---

## Part 3: Configure DNS (2 minutes)

Point your domain to your Coolify server.

### Get Your Server IP

```bash
# On your Coolify server, get the public IP:
curl ifconfig.me
```

### Update DNS Records

Go to your DNS provider (where `therink.io` is managed):

**Add A Record:**
```
Type: A
Name: re
Value: [Your Server IP]
TTL: 3600 (or Auto)
```

**Or CNAME (if using proxy):**
```
Type: CNAME
Name: re
Value: your-server.example.com
TTL: 3600
```

**Save** and wait 5-60 minutes for DNS propagation.

---

## Part 4: Configure SSL (Automatic)

Coolify automatically handles SSL with Let's Encrypt:

1. In Coolify, go to your application
2. **Settings** → **Domains**
3. Verify `re.therink.io` is listed
4. Click **Generate SSL Certificate**
5. Coolify will auto-renew every 90 days

---

## Part 5: Configure Supabase Auth URLs

1. Go back to Supabase dashboard
2. **Authentication** → **URL Configuration**
3. Add these to **Redirect URLs**:
   ```
   https://re.therink.io/auth/callback
   https://re.therink.io/**
   ```
4. Set **Site URL**: `https://re.therink.io`
5. Click **Save**

---

## Part 6: Test Deployment

### 1. Check if Site is Live

```bash
curl https://re.therink.io
# Should return HTML (the landing page)
```

### 2. Test on Desktop

1. Visit `https://re.therink.io`
2. Should see landing page
3. Click **Sign Up**
4. Create test account
5. Analyze a test deal

### 3. Test on Mobile

1. Open `https://re.therink.io` on your phone
2. Test responsive design
3. Create account
4. Analyze deal
5. Check dashboard

---

## Troubleshooting

### Build Fails

**Check Coolify build logs:**
1. Go to application in Coolify
2. Click **Deployments**
3. Click on failed deployment
4. Read build logs for errors

**Common issues:**
- Missing environment variables → Add them in Coolify
- Docker build error → Check Dockerfile syntax
- Out of memory → Increase server RAM or Docker limits

### DNS Not Resolving

```bash
# Check DNS propagation
nslookup re.therink.io

# Check from multiple locations
dig re.therink.io
```

**Wait 5-60 minutes** for DNS to propagate globally.

### SSL Certificate Issues

1. In Coolify → Application → Domains
2. Click **Force Regenerate SSL**
3. Make sure ports 80 and 443 are open on your server:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Container Not Starting

**Check logs:**
1. Coolify → Application → **Logs**
2. Look for errors in container startup

**Check container status:**
```bash
# SSH into your Coolify server
ssh user@your-server.com

# List containers
docker ps -a | grep rei-ops

# Check logs
docker logs <container-id>
```

### Database Connection Issues

**Verify environment variables:**
1. Coolify → Application → Environment Variables
2. Make sure all Supabase vars are correct

**Test Supabase connection:**
```bash
# From your local machine
curl https://xxxxx.supabase.co/rest/v1/

# Should return Supabase API info
```

### Can't Sign Up / Auth Issues

1. Check Supabase **Authentication** settings
2. Verify redirect URLs include `https://re.therink.io/**`
3. Check browser console for errors
4. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Coolify Tips & Tricks

### View Logs in Real-Time

```bash
# In Coolify dashboard
Application → Logs → Enable "Follow Logs"
```

### Restart Container

```bash
# In Coolify dashboard
Application → Actions → Restart
```

### Manual Redeploy

```bash
# In Coolify dashboard
Application → Deploy
```

### Update Environment Variables

1. Edit variables in Coolify
2. Click **Redeploy** to apply changes

### Scaling

To handle more traffic:

1. Coolify → Application → Resources
2. Increase CPU/Memory limits
3. Or: Deploy multiple instances behind a load balancer

---

## Performance Optimization

### Enable Caching

Add to environment variables:
```bash
NEXT_CACHE_HANDLER=filesystem
```

### Optimize Build

In Coolify build settings:
- Enable build cache
- Use BuildKit for faster builds

### Monitor Resources

```bash
# Check container resource usage
docker stats <container-name>
```

---

## Backup & Restore

### Backup Database (Supabase)

1. Supabase dashboard → Database → Backups
2. Enable automatic backups
3. Or: Use `pg_dump` to export:
   ```bash
   pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
   ```

### Backup Application

Your code is in GitHub, so:
1. Keep Git repo updated
2. Backup environment variables (save them securely)
3. Backup user-uploaded files (if any)

---

## Updating the Application

When you push updates to GitHub:

**Option 1: Auto-Deploy**
1. In Coolify → Application → **Git**
2. Enable **Automatic Deployment**
3. Coolify will rebuild on new commits

**Option 2: Manual Deploy**
1. Push changes to GitHub
2. In Coolify → Click **Deploy**
3. Coolify pulls latest code and rebuilds

---

## Server Requirements

### Minimum Specs

- **CPU**: 2 cores
- **RAM**: 2GB (4GB recommended)
- **Storage**: 20GB
- **OS**: Ubuntu 20.04+ or Debian 11+

### Recommended Specs

- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Network**: 100 Mbps+

---

## Security Checklist

- [ ] Firewall configured (UFW or iptables)
- [ ] SSH key-based authentication (no password)
- [ ] Non-root user for deployments
- [ ] SSL certificate active (Coolify handles this)
- [ ] Environment variables secured
- [ ] Supabase RLS policies enabled
- [ ] Regular backups configured
- [ ] Server updates scheduled

---

## Cost Comparison

### Self-Hosted (Coolify)
- Server: $5-20/month (VPS)
- Domain: $12/year
- **Total**: ~$10-25/month

### vs. Vercel/Netlify
- Free tier: Limited builds/bandwidth
- Pro tier: $20-100/month
- **Total**: $20-100/month

**Coolify Advantage**: Full control, no vendor lock-in, unlimited builds!

---

## Quick Reference

### Useful Commands

```bash
# Check if site is up
curl -I https://re.therink.io

# View container logs
docker logs -f <container-id>

# Restart container
docker restart <container-id>

# Check disk space
df -h

# Check memory usage
free -h

# Check running containers
docker ps
```

### Important URLs

- **Coolify Dashboard**: `http://your-server-ip:3000`
- **Application**: `https://re.therink.io`
- **Supabase**: `https://supabase.com/dashboard`

---

## Next Steps After Deployment

1. ✅ Test all features on mobile
2. ✅ Create demo account with sample deals
3. ✅ Share with beta users
4. ✅ Monitor logs for errors
5. ✅ Set up monitoring (Uptime Robot, etc.)
6. ✅ Configure backups
7. ✅ Plan v2.1 features based on feedback

---

## Support

**Issues?**
- Check Coolify docs: https://coolify.io/docs
- Check container logs in Coolify dashboard
- Review build logs for errors

**Need Help?**
- Coolify Discord: https://discord.gg/coolify
- Open GitHub issue on REI OPS™ repo

---

**Estimated Deployment Time:** 20-30 minutes

**Your app will be live at:** https://re.therink.io 🚀

Let's ship it! 🇨🇦
