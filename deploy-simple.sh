#!/bin/bash

# Simple Vercel deployment
echo "🚀 Starting deployment..."

# Check if authenticated
if ! vercel whoami &> /dev/null; then
    echo "❌ Please authenticate with Vercel first:"
    echo "vercel login"
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod --yes

echo "✅ Deployment complete!"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Get your deployment URL from the output above"
echo "2. Update Supabase auth settings:"
echo "   - Go to Supabase Dashboard → Authentication → Settings"
echo "   - Update Site URL to your Vercel URL"
echo "   - Add your Vercel URL to Redirect URLs"
echo "3. Set environment variables in Vercel dashboard if needed"