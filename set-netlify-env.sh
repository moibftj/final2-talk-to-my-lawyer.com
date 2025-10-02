#!/bin/bash
# Script to set Netlify environment variables

echo "Setting Netlify environment variables..."

netlify env:set VITE_SUPABASE_URL "https://hevnbcyuqxirqwhekwse.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhldm5iY3l1cXhpcnF3aGVrd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDU3MDUsImV4cCI6MjA3MzE4MTcwNX0.o_awyK7z7pHa06guTVGmsLANG4czQAvzJO1RP__Kwak"
netlify env:set VITE_API_URL "https://hevnbcyuqxirqwhekwse.supabase.co"
netlify env:set VITE_GEMINI_API_KEY "AIzaSyApbHzGazyIWR6QsQh76dhD0gWmfhN26Ts"
netlify env:set SUPABASE_URL "https://hevnbcyuqxirqwhekwse.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhldm5iY3l1cXhpcnF3aGVrd3NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYwNTcwNSwiZXhwIjoyMDczMTgxNzA1fQ.4yve642WCh_pofppAUwlt63XcaFfln2YwVEAttJ6MdU"
netlify env:set GEMINI_API_KEY "AIzaSyApbHzGazyIWR6QsQh76dhD0gWmfhN26Ts"

echo "Done! Environment variables set for Netlify."
