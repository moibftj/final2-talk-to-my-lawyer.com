#!/usr/bin/env bash
# Safely sync Netlify environment variables from local configuration

set -euo pipefail

netlify env:set VITE_SUPABASE_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW5rbnB4Z3BiZ2huYml5Ynl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzI4NzYsImV4cCI6MjA3MjEwODg3Nn0.yqAFETCuZrzb_Oi14eC-oHmZTUt6uG092l-oWZHPOfg"
netlify env:set VITE_API_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set SUPABASE_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW5rbnB4Z3BiZ2huYml5Ynl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUzMjg3NiwiZXhwIjoyMDcyMTA4ODc2fQ.E6NX2wCTKFoalMF8YpQU_Q-2wwo_6k6Cp0X8DfHXLHk"
netlify env:set SENDGRID_API_KEY "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"
netlify env:set OPENAI_API_KEY "your-openai-api-key"
=======
if ! command -v netlify >/dev/null 2>&1; then
  echo "Error: netlify CLI not found. Install it with 'npm install -g netlify-cli'." >&2
  exit 1
fi

ENV_FILE="${1:-.env.local}"
FALLBACK_ENV=".env"

load_env_file() {
  local file="$1"
  if [ -f "$file" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$file"
    set +a
    return 0
  fi
  return 1
}

if ! load_env_file "$ENV_FILE"; then
  if ! load_env_file "$FALLBACK_ENV"; then
    echo "Error: Could not find $ENV_FILE or $FALLBACK_ENV. Create a gitignored env file that follows Next.js conventions (e.g. .env.local)." >&2
    exit 1
  else
    echo "Loaded secrets from $FALLBACK_ENV (fallback). Consider moving them to .env.local for Next.js-compatible workflows."
  fi
else
  echo "Loaded secrets from $ENV_FILE"
fi

resolve_value() {
  local primary="$1"
  shift
  local candidates=("$primary" "$@")
  local candidate
  for candidate in "${candidates[@]}"; do
    local value="${!candidate-}"
    if [ -n "${value}" ]; then
      echo "$value"
      return 0
    fi
  done
  return 1
}

sync_var() {
  local netlify_key="$1"
  shift
  local value
  if ! value="$(resolve_value "$@")"; then
    echo "Error: Missing required variable for Netlify key '$netlify_key' (checked: $*)" >&2
    return 1
  fi
  netlify env:set "$netlify_key" "$value" >/dev/null
  echo "Synced $netlify_key"
}

# Prefer Vite-style names but fall back to Next.js conventions when present.
sync_var VITE_SUPABASE_URL VITE_SUPABASE_URL NEXT_PUBLIC_SUPABASE_URL
sync_var VITE_SUPABASE_ANON_KEY VITE_SUPABASE_ANON_KEY NEXT_PUBLIC_SUPABASE_ANON_KEY
sync_var VITE_API_URL VITE_API_URL NEXT_PUBLIC_API_URL
sync_var VITE_GEMINI_API_KEY VITE_GEMINI_API_KEY NEXT_PUBLIC_GEMINI_API_KEY

# Server-side secrets (never exposed client-side). Next.js stores these in .env.local without NEXT_PUBLIC_ prefix.
sync_var SUPABASE_URL SUPABASE_URL
sync_var SUPABASE_SERVICE_ROLE_KEY SUPABASE_SERVICE_ROLE_KEY
sync_var GEMINI_API_KEY GEMINI_API_KEY

echo "Done! Netlify environment variables are up to date."
