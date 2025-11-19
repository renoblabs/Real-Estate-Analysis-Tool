# Quick Deployment Guide for re.therink.io

## 1. Set Up Supabase (Do this FIRST)

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - Name: `rei-ops-production`
   - Database Password: (generate a strong one, save it)
   - Region: Choose closest to you (e.g., US East)
4. Click "Create new project" (takes ~2 minutes)

5. Once ready, go to **SQL Editor** (left sidebar)
6. Click "New Query"
7. Copy ALL content from `supabase/schema.sql` in your project
8. Paste and click "Run"
9. You should see "Success. No rows returned"

10. Go to **Project Settings** → **API** (left sidebar)
11. Copy these values (you'll need them for Vercel):
    - **Project URL**: `https://xxxxx.supabase.co`
    - **anon/public key**: `eyJhbGc...` (long string)
    - **service_role key**: Click "Reveal" and copy

---

## 2. Deploy to Vercel (5 minutes)

### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository:
   - Repository: `renoblabs/Real-Estate-Analysis-Tool`
   - Branch: `claude/build-rei-ops-platform-012C2QP91U6WCU3D9Tv4EN2y`

4. Configure Environment Variables:
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL = [Your Supabase Project URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [Your Supabase anon key]
   SUPABASE_SERVICE_ROLE_KEY = [Your Supabase service_role key]
   NEXT_PUBLIC_APP_URL = https://re.therink.io
   NEXT_PUBLIC_APP_NAME = REI OPS™
   ```

5. Click "Deploy"
6. Wait 2-3 minutes for build to complete

### Option B: Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: rei-ops
# - Directory: ./
# - Override settings? No

# Add environment variables when prompted
```

---

## 3. Configure Custom Domain (2 minutes)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add domain: `re.therink.io`
4. Vercel will show DNS records you need to add

5. Go to your DNS provider (where therink.io is hosted)
6. Add the DNS records Vercel shows:

   **Option A - CNAME (Recommended):**
   ```
   Type: CNAME
   Name: re
   Value: cname.vercel-dns.com
   ```

   **Option B - A Record:**
   ```
   Type: A
   Name: re
   Value: 76.76.21.21
   ```

7. Wait 5-60 minutes for DNS to propagate
8. Vercel will auto-detect and configure SSL

---

## 4. Update Supabase Auth Settings

1. Go back to Supabase dashboard
2. Go to **Authentication** → **URL Configuration**
3. Add these URLs:
   - **Site URL**: `https://re.therink.io`
   - **Redirect URLs**: Add:
     - `https://re.therink.io/auth/callback`
     - `https://re.therink.io/**`

4. Click "Save"

---

## 5. Test Your Deployment

1. Visit `https://re.therink.io`
2. You should see the landing page
3. Click "Sign Up" and create a test account
4. Try analyzing a deal:
   - Address: `123 Test Street`
   - City: `Toronto`
   - Province: `Ontario`
   - Purchase Price: `$600,000`
   - Down Payment: `20%`
   - Monthly Rent: `$3,000`
   - Fill in other required fields
5. Click "Analyze Deal"
6. Verify results show up correctly

---

## 🎯 Quick Checklist

- [ ] Supabase project created
- [ ] Database schema executed (supabase/schema.sql)
- [ ] Supabase API keys copied
- [ ] Vercel project created from GitHub
- [ ] Environment variables added to Vercel
- [ ] Deployment successful (check Vercel dashboard)
- [ ] Custom domain `re.therink.io` added in Vercel
- [ ] DNS records configured
- [ ] Supabase redirect URLs updated
- [ ] Test account created
- [ ] Test deal analyzed successfully

---

## 📱 Mobile Testing

Once deployed, test on your phone:

1. Open `https://re.therink.io` in mobile browser
2. Test responsive design (should work on 375px+ screens)
3. Try creating an account
4. Try analyzing a deal
5. Test keyboard shortcuts don't interfere on mobile

---

## 🐛 Troubleshooting

**If signup doesn't work:**
- Check Supabase Auth settings (URL Configuration)
- Check browser console for errors
- Verify environment variables in Vercel

**If DNS doesn't resolve:**
- Wait longer (can take up to 48 hours, usually 5-60 min)
- Check DNS propagation: https://dnschecker.org
- Verify CNAME/A record is correct

**If build fails:**
- Check Vercel build logs
- Verify environment variables are set
- Check for any TypeScript errors

**If deals don't save:**
- Check Supabase RLS policies are enabled
- Check browser console for errors
- Verify you're logged in

---

## ⚡ Quick Deploy Commands

If you want to deploy via CLI instead:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_NAME

# Redeploy with new env vars
vercel --prod
```

---

**Estimated Total Time:** 15-20 minutes + DNS propagation

Let me know when you're ready and I can help with any step!
