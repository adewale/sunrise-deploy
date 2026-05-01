# Deploy Sunrise on Cloudflare

Sunrise is single-user and self-hosted. Do not send tokens to a hosted service.

## Recommended: Deploy to Cloudflare button

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/adewale/sunrise&paid=true)

Deploy-button flow, following the Tasche pattern:

1. Click **Deploy to Cloudflare**.
2. Cloudflare forks the repo into your GitHub account.
3. Cloudflare parses `wrangler.jsonc` and provisions D1 + Queues.
4. Cloudflare prompts for secrets listed in `.dev.vars.example`, using descriptions from `package.json` `cloudflare.bindings`.
5. Cloudflare runs `npm run build` and `npm run deploy`.
6. Visit the deployed Worker URL.
7. The Sunrise homepage shows a first-boot checklist and the exact GitHub OAuth callback URL for that instance.

## Post-deploy steps

1. Create a GitHub OAuth app at <https://github.com/settings/developers>:
   - **Homepage URL:** your deployed Worker URL.
   - **Authorization callback URL:** `<your-worker-url>/callback`.
2. Add secrets in Cloudflare dashboard under **Workers & Pages → sunrise → Settings → Variables and Secrets**:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `OWNER_LOGIN`
   - optional `OWNER_ID`
   - `SESSION_SECRET`
3. Reload the Worker URL.
4. Sign in with GitHub.
5. Click **Manual refresh** to create the first scan.

## Manual CLI deploy

```bash
npm install
npm run verify
wrangler d1 create sunrise
wrangler queues create sunrise-github
# update wrangler.jsonc with your D1 database id if deploying manually
wrangler d1 migrations apply DB --remote
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put OWNER_LOGIN
wrangler secret put SESSION_SECRET
wrangler deploy
```

Cloudflare Access can be added as an optional extra protection layer, but GitHub OAuth owner sign-in is the product auth model.

## Why the app shows onboarding

Users do not know their workers.dev URL before deployment, but GitHub OAuth requires an exact callback URL. Sunrise derives the current URL from the request and shows:

```txt
Homepage URL: https://your-worker.workers.dev
Callback URL: https://your-worker.workers.dev/callback
```

This avoids asking users to infer callback paths from docs.
