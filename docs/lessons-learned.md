# Lessons Learned

## 1. A panel is not a section

`panel` should only mean the visual surface: border, radius, background, and shadow.

Spacing and layout rhythm belong to `section`, `masthead`, `hero`, or another structural class.

Bad:

```html
<section class="panel">
  <p class="eyebrow">Table</p>
</section>
```

Good:

```html
<section class="section panel">
  <p class="eyebrow">Table</p>
</section>
```

Why: using `panel` alone caused content to sit against the card edge because it had no internal padding.

## 2. The design page must reuse real components

The public `/design` page exists to reveal drift. When possible, use shared render helpers such as:

- `renderMetric`
- `renderItem`
- `renderSetupGuide` patterns

Avoid hand-writing lookalike markup. If a sample must be custom, it should still use the same structural classes as the production UI.

## 3. Heading hierarchy matters in component samples

Use `h1` for page-level titles only. Component examples should usually use `h2` inside `.section-head`.

The design table sample originally used `h1`, making a small panel feel like a page hero.

## 4. Dark-mode affordance is a system problem

Buttons looking flat in dark mode was not only a button problem. It revealed inconsistent dark surfaces across:

- panels;
- cards;
- chips;
- setup blocks;
- tables;
- buttons.

The fix was to consolidate shared tokens and surface rules instead of adding one-off button styles.

## 5. Theme transitions should not flash

A bright day-to-night wash is painful in dark mode. Theme transitions should be subtle and directional:

- going dark: low-opacity navy dim;
- going light: very faint warm lift;
- always respect `prefers-reduced-motion`.

## 6. Keep visual primitives small

The design language became more consistent after shrinking to shared primitives:

- `--surface`, `--surface-2`, `--surface-3`;
- `--line`, `--line-strong`;
- `--accent`, `--accent-ink`;
- `--shadow`, `--button-shadow`;
- `--radius`, `--inner`.

More tokens and one-off overrides made the UI harder to reason about.

## 7. Fixed header needs reserved space

The fixed `Sunrise` header and theme toggle can overlap unless the header reserves right-side space and truncates safely.

Use:

- `right` offset on `.site-header`;
- `min-width: 0`;
- `overflow: hidden` only when clipping is acceptable;
- `text-overflow: ellipsis` only when clipping is acceptable.

Fraunces can be clipped by `overflow: hidden` and tight `line-height`. For wordmarks, prefer visible overflow, slight vertical padding, and a safer line height.

## 8. Strong grids prevent accidental collisions

Use grid layouts with `minmax(0, 1fr)` for panels, cards, item rows, and config rows. This prevents text and buttons from overlapping when content is long.

Tables should have a minimum width rather than crushing columns into unreadability.

## 9. Do not mix manual Cloudflare deploys with deploy-button dogfooding

We first deployed Sunrise manually with Wrangler. That created real account-level resources:

```txt
Worker: sunrise
D1: sunrise
Queue: sunrise-github
```

Then we tried to test the Deploy to Cloudflare path in the same Cloudflare account. The deploy-button fork tried to consume the same queue name and failed:

```txt
Queue 'sunrise-github' already has a consumer.
```

Cloudflare Queues can only have one consumer. OAuth/secrets named `sunrise-deploy` do not rename infrastructure. Queue/D1/Worker names come from `wrangler.jsonc` and the Deploy to Cloudflare setup page.

Correct dogfood path:

1. Start from the public template repo.
2. Click Deploy to Cloudflare.
3. In Cloudflare's setup page, choose deployment-specific resource names such as:
   - Worker: `sunrise-deploy`
   - D1: `sunrise-deploy`
   - Queue: `sunrise-deploy-github`
4. Let Cloudflare write those selected names/IDs into the fork it creates.
5. Do not edit the source template or local Wrangler config to fix a single deployment.

If a deploy-button project already exists, change that deployment's forked repo, not the source template repo.

## 10. Template repos must not contain local Cloudflare resource IDs

A template intended for Deploy to Cloudflare should keep generic/default resource names and placeholder IDs, for example:

```jsonc
"database_id": "<DATABASE_ID>"
```

Cloudflare's deploy flow provisions resources and updates the fork with concrete IDs. Committing a real D1 ID from a manual deployment makes the template account-specific and can send other deployments toward the wrong database.

## 11. `binding` is code API; resource names are deployment API

For Queues:

```jsonc
"producers": [{ "binding": "GITHUB_QUEUE", "queue": "sunrise-github" }]
```

- `binding` is the stable variable name code uses: `env.GITHUB_QUEUE`.
- `queue` is the Cloudflare resource name and should be deployment-specific when needed.

Do not change the binding to avoid collisions. Change the resource name in the deploy setup page or in that deployment's fork.

## 12. Deploy-button secrets are not infrastructure names

Values like these are application configuration:

```txt
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
OWNER_LOGIN
SESSION_SECRET
```

They do not affect Worker, D1, or Queue names. If a build error mentions a queue/database/consumer collision, changing OAuth secret values cannot fix it.

## 13. GitHub OAuth 404 usually means the wrong app/client ID

If GitHub sends the user to `/login/oauth/authorize?...` and GitHub returns 404, suspect the `client_id` first.

For Sunrise, `GITHUB_CLIENT_ID` must come from a GitHub **OAuth App**, not a GitHub App, not the app display name, and not a Cloudflare value.

The OAuth app should use:

```txt
Homepage URL: https://your-worker.workers.dev
Authorization callback URL: https://your-worker.workers.dev/callback
```

## 14. What to do after a successful deploy-button build

When the build succeeds and logs show bindings like:

```txt
env.GITHUB_QUEUE (sunrise-deploy-github)
env.DB (sunrise-deploy)
```

next steps are:

1. Visit the deployed Worker URL.
2. Confirm the homepage setup checklist renders.
3. Create or verify the GitHub OAuth App with the exact callback URL shown by Sunrise.
4. In Cloudflare dashboard, set/update secrets:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `OWNER_LOGIN`
   - `SESSION_SECRET`
5. Reload the Worker.
6. Click **Sign in with GitHub**.
7. If login succeeds, click **Manual refresh**.
8. Visit `/dashboard`, `/runs`, and `/design`.
9. If refresh fails, inspect `/runs` and Cloudflare Worker logs before changing infrastructure.

## 15. How Cloudflare Deploy Button docs could prevent this

Cloudflare's Deploy to Cloudflare docs are directionally right, but several points should be more explicit for apps with Queues and D1:

1. **Show a concrete before/after Wrangler example.**
   - Before template: placeholder D1 ID and default queue name.
   - After deploy fork: concrete D1 ID and user-selected queue name.

2. **Explain where edited setup values are written.**
   Users need to know that resource names chosen in the setup page are written into the newly-created fork, not the source repository and not the local machine.

3. **Warn that queue names are account-level and single-consumer.**
   A troubleshooting callout should say: if a build fails with “Queue already has a consumer,” choose a unique queue name or delete the existing consumer/queue.

4. **Differentiate secrets from resources.**
   The docs should explicitly say `.dev.vars.example` values configure secrets/env vars only. They do not rename D1 databases, Queues, or Workers.

5. **Add a dogfooding/testing recipe.**
   Recommended path for template authors:
   - do not manually deploy with the same resource names;
   - test deploy-button flow in a clean account or choose unique resource names;
   - verify the forked repo contains rewritten Wrangler values.

6. **Document how to edit an already-created deploy-button project.**
   The practical answer is: edit the fork Cloudflare created, commit, and let Workers Builds redeploy. This should be prominent.

7. **Clarify D1 placeholder expectations.**
   The docs mention default values, but examples should show that template repos may use `<DATABASE_ID>` and that Cloudflare will replace it in the fork.

8. **Surface queue consumer conflicts in the dashboard UI.**
   The error should include suggested fixes and a link to the queue resource already consuming the queue.
