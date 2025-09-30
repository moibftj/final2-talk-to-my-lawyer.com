#!/usr/bin/env bash
set -euo pipefail

# Netlify automated deployment script
# Usage: NETLIFY_AUTH_TOKEN=... ./deploy-netlify.sh
# Optional env overrides: SITE_NAME (default: approved-my-lawyer)

SITE_NAME_SLUG=${SITE_NAME:-approved-my-lawyer}

if ! command -v netlify >/dev/null 2>&1; then
  echo "Installing netlify-cli locally (fallback)" >&2
  npx --yes netlify-cli --version >/dev/null
fi

if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  echo "ERROR: NETLIFY_AUTH_TOKEN not set. Get a personal access token from https://app.netlify.com/user/applications#personal-access-tokens" >&2
  exit 1
fi

# Ensure build exists
if [ ! -d dist ]; then
  echo "Building project..." >&2
  npm run build
fi

# Check if site already exists
EXISTING_ID=$(npx netlify sites:list --json | jq -r --arg NAME "$SITE_NAME_SLUG" '.[] | select(.name==$NAME) | .id' || true)
if [ -n "$EXISTING_ID" ]; then
  echo "Site already exists: $SITE_NAME_SLUG ($EXISTING_ID)" >&2
  SITE_ID=$EXISTING_ID
else
  echo "Creating Netlify site: $SITE_NAME_SLUG" >&2
  CREATE_JSON=$(npx netlify sites:create --name "$SITE_NAME_SLUG" --json)
  SITE_ID=$(echo "$CREATE_JSON" | jq -r '.site_id // .id')
  echo "Created site id: $SITE_ID" >&2
fi

# Set required environment variables
REQ_VARS=(VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_API_URL VITE_GEMINI_API_KEY)
for VAR in "${REQ_VARS[@]}"; do
  VAL=${!VAR:-}
  if [ -z "$VAL" ]; then
    echo "WARNING: $VAR not set in shell; leaving unchanged on Netlify" >&2
  else
    echo "Setting $VAR" >&2
    npx netlify env:set "$VAR" "$VAL" --site "$SITE_ID" >/dev/null
  fi
done

echo "Deploying (production)..." >&2
npx netlify deploy --prod --dir=dist --site "$SITE_ID"

echo "Finished. Manage at: https://app.netlify.com/sites/$SITE_NAME_SLUG"