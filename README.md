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

### Security: Supabase Service Role Handling
The Supabase service role key must NEVER be exposed to the browser.

Guidelines:
1. Do NOT store it in any variable beginning with `VITE_`.
2. Provide it only as `SUPABASE_SERVICE_ROLE_KEY` in Netlify environment settings.
3. Use it exclusively inside server contexts (Netlify Functions / Edge Functions / Supabase functions).
4. The helper `services/supabaseAdmin.ts` centralizes creation of the privileged client.
5. If leaked, rotate the key in the Supabase dashboard immediately.

Client code should always use the anon key (`VITE_SUPABASE_ANON_KEY`).

### Key Rotation Policy

To reduce blast radius, rotate sensitive credentials on a schedule and after any suspected exposure.

| Secret | Scope | Recommended Cadence | Triggered Rotation Events |
| ------ | ----- | ------------------- | -------------------------- |
| SUPABASE_SERVICE_ROLE_KEY | Server-only (Netlify Functions) | Quarterly | Leak, permission changes, repo history rewrite |
| VITE_SUPABASE_ANON_KEY | Public (client) | Semi-annual | Leak, Supabase project clone, auth config changes |
| GEMINI_API_KEY | Server-only | Quarterly | Leak, provider policy change |

Rotation (Service Role Example):
1. Generate new key in Supabase: Settings → API → Regenerate service_role.
2. Add new value in Netlify as `SUPABASE_SERVICE_ROLE_KEY` (keep old until deploy validated if zero-downtime needed).
3. Trigger deploy.
4. Verify protected endpoints (e.g. get-all-users) still succeed.
5. Remove old key from Supabase (invalidate) and any local shells.
6. Confirm built JS bundles do NOT contain the new key (grep first 8 chars—should be absent).

Incident Response Steps:
1. Revoke/rotate affected keys immediately.
2. Audit Supabase logs (Auth + SQL) for anomalous access.
3. Force sign-out (invalidate refresh tokens) if user session compromise suspected.
4. Document timeline & remediation.

Future Automation Ideas:
- CI grep for base64 JWT header pattern: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ`.
- Scripted rotation + deployment verification.

