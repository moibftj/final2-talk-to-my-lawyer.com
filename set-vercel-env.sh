#!/bin/bash

# Vercel Environment Variables Setup Script
# This script sets up all environment variables for the Talk-To-My-Lawyer application on Vercel

set -e

echo "🚀 Setting up Vercel environment variables for Talk-To-My-Lawyer..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Load environment variables from .env file
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

echo "📝 Setting environment variables..."

# Set Supabase configuration
vercel env add VITE_SUPABASE_URL "$VITE_SUPABASE_URL" production --yes
vercel env add VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY" production --yes
vercel env add VITE_API_URL "$VITE_API_URL" production --yes

# Set API keys
vercel env add SENDGRID_API_KEY "$SENDGRID_API_KEY" production --yes
vercel env add OPENAI_API_KEY "$OPENAI_API_KEY" production --yes

# Set server-side secrets
vercel env add SUPABASE_URL "$SUPABASE_URL" production --yes
vercel env add SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY" production --yes

echo "✅ Environment variables set successfully!"

# Also set for preview/development environments
echo "📝 Setting environment variables for preview and development..."

vercel env add VITE_SUPABASE_URL "$VITE_SUPABASE_URL" preview --yes
vercel env add VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY" preview --yes
vercel env add VITE_API_URL "$VITE_API_URL" preview --yes
vercel env add SENDGRID_API_KEY "$SENDGRID_API_KEY" preview --yes
vercel env add OPENAI_API_KEY "$OPENAI_API_KEY" preview --yes
vercel env add SUPABASE_URL "$SUPABASE_URL" preview --yes
vercel env add SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY" preview --yes

vercel env add VITE_SUPABASE_URL "$VITE_SUPABASE_URL" development --yes
vercel env add VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY" development --yes
vercel env add VITE_API_URL "$VITE_API_URL" development --yes
vercel env add SENDGRID_API_KEY "$SENDGRID_API_KEY" development --yes
vercel env add OPENAI_API_KEY "$OPENAI_API_KEY" development --yes
vercel env add SUPABASE_URL "$SUPABASE_URL" development --yes
vercel env add SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY" development --yes

echo "✅ All environment variables set for production, preview, and development!"
echo "🎉 Vercel environment setup complete!"