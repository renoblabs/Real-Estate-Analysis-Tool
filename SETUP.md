# REI OPS™ - Setup Guide

Complete setup instructions for deploying REI OPS™, the Canadian real estate investment analysis platform.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed
- Vercel account (for deployment)

## Local Development Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Real-Estate-Analysis-Tool
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (takes ~2 minutes)
3. Go to Project Settings → API
4. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="REI OPS™"
```

### 4. Set up Database Schema

1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click "Run" to execute

This will create:
- `deals` table
- `user_preferences` table
- `analytics_events` table
- All necessary indexes
- Row Level Security policies

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Testing the Application

### Create a Test Account

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Create an account with your email
4. You'll be redirected to the dashboard

### Analyze Your First Deal

1. Click "Analyze New Deal" from the dashboard
2. Fill in the form with property details
3. Example test data:
   - **Address**: 123 Test Street
   - **City**: Toronto
   - **Province**: Ontario
   - **Property Type**: Single Family
   - **Purchase Price**: $600,000
   - **Down Payment**: 20%
   - **Interest Rate**: 5.5%
   - **Monthly Rent**: $3,000
   - **Property Tax**: $5,000/year
   - **Insurance**: $1,200/year

4. Click "Analyze Deal"
5. See your complete Canadian analysis with:
   - CMHC insurance calculations
   - Land transfer tax for Ontario
   - OSFI B-20 stress test
   - Cash flow projections
   - Deal scoring

## Production Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial REI OPS deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from your `.env.local`
   - Change `NEXT_PUBLIC_APP_URL` to your production URL

5. Click "Deploy"

### 3. Configure Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Features Overview

### ✅ Completed Features

- **Landing Page**: Professional marketing site with features, pricing, and CTA
- **Authentication**: Email/password signup and login via Supabase
- **Dashboard**: Overview of deals with stats and recent activity
- **Deal Analyzer**: Complete Canadian analysis form with:
  - CMHC insurance calculations
  - Provincial land transfer taxes (ON, BC, AB, NS, QC)
  - OSFI B-20 stress test compliance
  - BRRRR strategy support
  - Real-time calculations
  - Deal scoring (A-F grades)
- **Database**: Full PostgreSQL schema with RLS policies
- **Mobile Responsive**: Works on all screen sizes

### 🚧 Features to Add (v1.1+)

- Deal comparison tool
- PDF export functionality
- All deals list page with filtering/sorting
- Settings page for user preferences
- Deal editing
- Favorite deals
- Team collaboration
- Payment integration
- MLS data integration

## Troubleshooting

### Build Errors

If you see TypeScript errors during build:
```bash
npm run build
```

Check the error messages and ensure all TypeScript types are correct.

### Database Connection Issues

1. Verify your Supabase URL and keys in `.env.local`
2. Check that you've run the schema.sql file
3. Verify RLS policies are enabled

### Authentication Issues

1. Check Supabase Auth settings
2. Ensure email confirmation is disabled for development
3. Verify redirect URLs in Supabase settings

## Support

For issues or questions:
- Open an issue on GitHub
- Check the README.md for additional documentation

## License

Copyright © 2024 REI OPS™. All rights reserved.
