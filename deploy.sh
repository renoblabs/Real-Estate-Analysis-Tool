#!/bin/bash

# REI OPS™ - Quick Deploy Script
# This script helps you deploy to Vercel with custom domain

echo "🚀 REI OPS™ Deployment Script"
echo "================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo "🔐 Logging into Vercel..."
vercel login

echo ""
echo "⚙️  Before deploying, make sure you have:"
echo "  1. ✅ Supabase project created"
echo "  2. ✅ Database schema executed (supabase/schema.sql)"
echo "  3. ✅ Supabase API keys ready"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "📝 Enter your Supabase details:"
read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY

echo ""
echo "🌐 Setting environment variables..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://re.therink.io"
vercel env add NEXT_PUBLIC_APP_NAME production <<< "REI OPS™"

echo ""
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Go to Vercel dashboard"
echo "  2. Settings → Domains → Add 're.therink.io'"
echo "  3. Configure DNS: CNAME re → cname.vercel-dns.com"
echo "  4. Update Supabase Auth URLs to include https://re.therink.io/**"
echo ""
echo "🎉 Your app will be live at: https://re.therink.io"
echo ""
