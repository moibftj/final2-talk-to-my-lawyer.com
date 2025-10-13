#!/bin/bash

# Update Supabase Auth Configuration for Production
# Run this after deploying to Vercel to update the site URL

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <your-vercel-domain>"
    echo "Example: $0 talk-to-my-lawyer.vercel.app"
    exit 1
fi

DOMAIN=$1
echo "🔧 Updating Supabase auth configuration for domain: $DOMAIN"

# Update the site_url in config.toml
sed -i "s|site_url = \"https://your-app-name.vercel.app\"|site_url = \"https://$DOMAIN\"|g" supabase/config.toml

# Update additional_redirect_urls
sed -i "s|\"https://your-app-name.vercel.app\"|\"https://$DOMAIN\"|g" supabase/config.toml

echo "✅ Updated supabase/config.toml with production domain"

# Update the auth settings on the remote Supabase instance
echo "🚀 Updating remote Supabase auth settings..."
echo "Please manually update the following in your Supabase Dashboard:"
echo "1. Go to Authentication → Settings → General"
echo "2. Update Site URL to: https://$DOMAIN"
echo "3. Add Redirect URLs: https://$DOMAIN"
echo ""
echo "Or run these SQL commands in your Supabase SQL editor:"
echo "UPDATE auth.config SET site_url = 'https://$DOMAIN';"
echo "UPDATE auth.config SET additional_redirect_urls = '[\"https://$DOMAIN\", \"http://127.0.0.1:3000\"]';"

echo "✅ Configuration update complete!"