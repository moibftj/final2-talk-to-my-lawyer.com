<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1jcNus_RZaqWWrN2-hIC4JwqatOfQOAj9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
## Deploy to Netlify (approved-my-lawyer)

You can deploy this project to Netlify with a single script. The site name requested: `approved My Lawyer` (Netlify slug will become `approved-my-lawyer`).

### 1. Prerequisites
* Netlify account: https://app.netlify.com
* Personal Access Token (PAT): Create one at https://app.netlify.com/user/applications#personal-access-tokens
* Node.js v20+ (build uses 20.19.0 in `netlify.toml`)

### 2. Prepare Environment Variables
Create a local `.env` (NOT committed) or export in your shell:

```
export VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
export VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
export VITE_API_URL="https://YOUR-PROJECT.supabase.co"
export VITE_GEMINI_API_KEY="YOUR_GEMINI_KEY"
export NETLIFY_AUTH_TOKEN="YOUR_NETLIFY_PAT"
```

Alternatively, copy `.env.example` to `.env` and fill in values (for local dev only).

### 3. One-Command Build & Deploy

```
./deploy-netlify.sh
```

The script will:
1. Ensure the project is built (`npm run build` if `dist/` missing)
2. Create the site `approved-my-lawyer` if it does not exist
3. Push environment variables to Netlify (only those present in your shell)
4. Trigger a production deploy

### 4. Manual Netlify Setup (If you prefer UI)
1. New Site -> Import from Git
2. Select this repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables:
    * `VITE_SUPABASE_URL`
    * `VITE_SUPABASE_ANON_KEY`
    * `VITE_API_URL` (can match Supabase URL)
    * `VITE_GEMINI_API_KEY`
6. Deploy, then visit the URL Netlify provides.

### 5. Post-Deployment Checklist
* Auth flows (signup/login/reset) work
* Network calls hit Netlify Functions (`/api/*` -> `/.netlify/functions/*` per `netlify.toml`)
* CSP / mixed content (if you later add) are clean
* No 404 on client-side routes (fallback redirect configured)

### 6. Updating Deployment
Push to `main` (if connected) or re-run `./deploy-netlify.sh` for ad-hoc deploys.

---
If the automated script fails due to auth, confirm the `NETLIFY_AUTH_TOKEN` is valid and has write permissions.
