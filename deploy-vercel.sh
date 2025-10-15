#!/bin/bash

# Vercel Deployment Script for Talk-To-My-Lawyer
# This script builds and deploys the application to Vercel

set -e

echo "🚀 Starting Vercel deployment for Talk-To-My-Lawyer..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
fi

# Build the project
echo "🔨 Building the project..."
pnpm build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

echo "✅ Deployment completed successfully!"
echo "🎉 Your Talk-To-My-Lawyer application is now live on Vercel!"

# Get the deployment URL
DEPLOYMENT_URL=$(vercel ls --limit=1 | grep -o 'https://[^ ]*')
echo "📍 Your deployment URL: $DEPLOYMENT_URL"

# Extract domain from URL
DOMAIN=$(echo $DEPLOYMENT_URL | sed 's|https://||')

echo ""
echo "🔧 IMPORTANT: Update your Supabase auth configuration:"
echo "Run this command to update auth settings:"
echo "./update-auth-config.sh $DOMAIN"
echo ""
echo "Or manually update in Supabase Dashboard:"
echo "1. Go to Authentication → Settings → General"
echo "2. Update Site URL to: $DEPLOYMENT_URL"
echo "3. Add to Redirect URLs: $DEPLOYMENT_URL"