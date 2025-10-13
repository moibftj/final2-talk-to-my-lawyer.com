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

# Show deployment URL
echo "📍 You can view your deployment at:"
vercel ls --limit=1