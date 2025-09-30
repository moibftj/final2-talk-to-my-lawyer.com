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

# Check if site already exists (Netlify API)
echo "Checking if site exists via Netlify API" >&2
SITE_LOOKUP=$(curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" "https://api.netlify.com/api/v1/sites?name=$SITE_NAME_SLUG") || SITE_LOOKUP="[]"
SITE_ID=$(echo "$SITE_LOOKUP" | jq -r '.[0].id // empty')
if [ -n "$SITE_ID" ]; then
  echo "Site already exists: $SITE_NAME_SLUG ($SITE_ID)" >&2
else
  echo "Creating Netlify site: $SITE_NAME_SLUG" >&2
  CREATE_JSON=$(curl -s -X POST -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" -H 'Content-Type: application/json' \
    -d '{"name":"'"$SITE_NAME_SLUG"'"}' https://api.netlify.com/api/v1/sites)
  SITE_ID=$(echo "$CREATE_JSON" | jq -r '.id')
  if [ -z "$SITE_ID" ] || [ "$SITE_ID" = "null" ]; then
    echo "ERROR: Failed to create site. Response:" >&2
    echo "$CREATE_JSON" >&2
    exit 1
  fi
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
    # Use API to set env var (context=all)
    curl -s -X POST -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
      -H 'Content-Type: application/json' \
      -d '{"key":"'"$VAR"'","values":[{"value":"'"$VAL"'","context":"all"}]}' \
      "https://api.netlify.com/api/v1/sites/$SITE_ID/env" >/dev/null || echo "Failed to set $VAR" >&2
  fi
done

echo "Deploying (production)..." >&2
npx netlify deploy --prod --dir=dist --site "$SITE_ID" || {
  echo "CLI deploy failed, attempting direct API deploy (draft)" >&2
  ZIP_FILE=$(mktemp /tmp/sitezip.XXXXXX.zip)
  (cd dist && zip -qr "$ZIP_FILE" .)
  curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" -F "file=@$ZIP_FILE" \
    https://api.netlify.com/api/v1/sites/$SITE_ID/deploys >/dev/null && echo "Fallback deploy uploaded (draft)." || echo "Fallback deploy failed." >&2
  rm -f "$ZIP_FILE"
}

echo "Finished. Manage at: https://app.netlify.com/sites/$SITE_NAME_SLUG"