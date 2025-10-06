#!/bin/bash
# Script to set Netlify environment variables

echo "Setting Netlify environment variables..."

netlify env:set VITE_SUPABASE_URL "https://your-project-ref.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-supabase-anon-key"
netlify env:set VITE_API_URL "https://your-project-ref.supabase.co"
netlify env:set SUPABASE_URL "https://your-project-ref.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-supabase-service-role-key"
netlify env:set OPENAI_API_KEY "your-openai-api-key"

echo "Done! Environment variables set for Netlify."
