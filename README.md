# Sunrise

A self-hosted morning dashboard for the GitHub work that needs your attention.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-org/sunrise&paid=true)

Public homepage → GitHub repo → Deploy your own version → own your data.

## Deploy

1. Click **Deploy to Cloudflare** above. Cloudflare forks the repo and provisions D1 + Queues from `wrangler.jsonc`.
2. Once deployed, note your Worker URL, for example `https://sunrise-abc.workers.dev`.
3. Create a **GitHub OAuth App** at <https://github.com/settings/developers>:
   - **Homepage URL:** your Worker URL
   - **Authorization callback URL:** `<your-worker-url>/callback`
4. In Cloudflare, open **Workers & Pages → sunrise → Settings → Variables and Secrets** and set:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `OWNER_LOGIN`
   - optional `OWNER_ID`
   - `SESSION_SECRET`
5. Reload your Worker URL, sign in with GitHub, and run **Manual refresh**.

The first page includes the same setup checklist with the exact callback URL for that deployed instance.

## Manual deploy

```bash
npm install
npm run verify
wrangler d1 create sunrise
wrangler queues create sunrise-github
wrangler d1 migrations apply DB --remote
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put OWNER_LOGIN
wrangler secret put SESSION_SECRET
wrangler deploy
```

See [docs/deploy.md](docs/deploy.md).
