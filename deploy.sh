#!/bin/bash

# Talk to My Lawyer - Deployment Script
echo "🚀 Deploying Talk to My Lawyer Three-Tier Application..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."

# Check if user is logged in to Netlify
if ! netlify status &> /dev/null; then
    echo "🔐 Please log in to Netlify first:"
    netlify login
fi

# Deploy (draft first)
echo "📤 Creating draft deployment..."
netlify deploy --dir=dist --message="Three-tier system deployment - $(date)"

# Ask user if they want to deploy to production
read -p "🎯 Deploy to production? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to production..."
    netlify deploy --prod --dir=dist --message="PRODUCTION: Three-tier system deployment - $(date)"
    echo "✅ Production deployment complete!"

    # Open the site
    read -p "🌐 Open deployed site? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        netlify open
    fi
else
    echo "📋 Draft deployment created. Use 'netlify deploy --prod' to promote to production."
fi

echo "🎉 Deployment process complete!"
echo ""
echo "📊 Next steps:"
echo "1. Test the deployed application"
echo "2. Verify three-tier authentication"
echo "3. Test employee coupon system"
echo "4. Check admin analytics"
echo "5. Monitor for any issues"
echo ""
echo "🔗 Useful commands:"
echo "  netlify status    - Check deployment status"
echo "  netlify logs      - View function logs"
echo "  netlify open      - Open deployed site"