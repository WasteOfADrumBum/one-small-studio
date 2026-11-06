# Setup and deployment

How One Small Studio is built, configured, deployed, watched and rolled back. Everything here runs
on free tiers; nothing in this repo needs a paid plan.

## Services in use

| Service                   | What it does                                                                             | Plan / cost                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| GitHub                    | Code, pull requests, CI (GitHub Actions)                                                 | Free (public repo)                                              |
| Vercel                    | Hosts the site and runs `/api/*` as one Node function                                    | Hobby (free). Hobby has no billing; it pauses at its limits     |
| Resend                    | Sends each talkback message to Josh's inbox                                              | Free: 100 emails a day, 3,000 a month; sending stops at the cap |
| SoundCloud                | Plays the albums (Widget API iframe) and supplies cover art (oEmbed)                     | Free, no API key                                                |
| Domain `onesmall.company` | `studio.onesmall.company` points at the Vercel project; verified sender domain in Resend | Owned by Josh, outside this repo                                |

There is no database. Messages are emailed, not stored; the old MongoDB inbox was removed in PR #14.
The site sets no cookies and loads no analytics.

## Local setup

Requires Node 22.12 or newer (`.nvmrc` says 22).

```sh
npm ci
cp .env.example .env   # optional: only needed to send real email locally
npm run dev            # site on http://localhost:5173, API on http://localhost:3001
```

Without `RESEND_API_KEY` and `CONTACT_TO` the site works and the talkback form answers "The
talkback line is not connected yet." (HTTP 503). That is the expected state on preview deployments.

## Checks (what CI runs on every pull request and every push to `main`)

```sh
npm run verify          # format, lint, types, unit/API tests, build, budgets, Chromium browser tests
npx playwright install --with-deps chromium   # once per machine
npm run test:e2e:all    # adds the Firefox and WebKit critical journeys (install those browsers first)
```

The browser tests run against the production build served by `server/preview.ts`, which applies
`vercel.json`'s rewrites and headers and runs the real Express API with a mail sink in place of
Resend. SoundCloud is stubbed (`e2e/fixtures.ts`). Pipeline, jobs, timings and triage:
[ci/README.md](ci/README.md).

## Environment variables (Vercel > Project > Settings > Environment Variables)

| Name             | Scope      | Required | Notes                                                                                       |
| ---------------- | ---------- | -------- | ------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY` | Production | Yes      | Resend > API Keys. Mark it Sensitive. A sending-only key is enough                          |
| `CONTACT_TO`     | Production | Yes      | The inbox that receives messages. Kept out of the public repo on purpose                    |
| `CONTACT_FROM`   | Production | No       | e.g. `One Small Studio <studio@onesmall.company>`; must be on the domain verified in Resend |

They are deliberately Production only, so preview deployments cannot email Josh. After changing
any of them, redeploy production for the change to take effect.

## Deploying

- Every pull request gets a Vercel preview URL (protected by Vercel Authentication, so only Josh's
  Vercel account can open it).
- Merging to `main` deploys to production automatically: `studio.onesmall.company` and
  `one-small-studio.vercel.app`.
- Merge only with the `gate` check green. Release approval belongs to Josh.
- After each production deployment, `.github/workflows/smoke.yml` checks the live site read-only
  and opens a `production-smoke` issue if it fails (see [ci/README.md](ci/README.md)).

## Security headers and caching

All set in `vercel.json`:

- Every path: Content-Security-Policy, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`. Any new third-party host (script, image, frame, fetch)
  must be added to the CSP or the browser will block it. `e2e/security.spec.ts` enforces this.
- `/assets/*` (Vite's content-hashed files): `Cache-Control: public, max-age=31536000, immutable`.
- `/api/*`: `Cache-Control: no-store`.
- HTTPS and HSTS come from Vercel itself.

Check production after a deploy:

```sh
curl -sI https://studio.onesmall.company/ | grep -iE 'content-security|strict-transport|x-frame|x-content-type|referrer|permissions'
curl -s https://studio.onesmall.company/ | grep -o '/assets/index-[^"]*\.js' | head -1 \
  | xargs -I{} curl -sI https://studio.onesmall.company{} | grep -i cache-control
curl -s https://studio.onesmall.company/api/health
```

## Contact form protection

- Same-origin check on every POST (CSRF).
- Hidden honeypot field; bots that fill it get a fake success.
- Zod validation on both sides; bodies over 16 KB are refused (413), malformed JSON gets 400.
- Three messages per sender per hour, keyed by a hash of the IP (never the IP itself). The count
  lives in function memory, so a cold start resets it. Resend's free-tier daily cap (100) is the
  hard backstop.
- The Resend call times out after 8 s; the browser gives up after 20 s and keeps the message.
- Failures are logged to Vercel's runtime logs (`Talkback email failed: ...`) with Resend's answer.
  Visitors only see a friendly message. Message bodies are never logged.

## Monitoring

Free-tier, no extra service:

- Vercel > Project > Logs (filter `Talkback email failed`) and Observability > Errors.
- Vercel emails the account owner when a production deployment fails.
- Resend > Emails shows every send and bounce; Resend > Usage shows the daily and monthly caps.
- GitHub Actions emails on a failed CI run on `main`.
- The production smoke (after each deploy and every 6 hours) opens or updates one
  `production-smoke` issue on failure and closes it on recovery.

## Rollback

Vercel keeps every production deployment.

- Dashboard: Vercel > Project > Deployments > pick the last good one > `...` > **Instant Rollback**.
- CLI: `npx vercel rollback <deployment-url> --scope task-forge3`, then `npx vercel promote
<deployment-url> --scope task-forge3` once a fix ships (rollback pauses auto-assignment of
  production domains until you promote).
- Code: `git revert <merge-commit>` on a branch, open a PR, merge. Never force-push `main`.

## Content changes

There is no admin page by design. Content lives in code:

- `src/content/releases.ts`: albums. Private SoundCloud sets need the API URL with its
  `secret_token`, copied from SoundCloud's Share > Embed code (`url=` parameter).
- `src/content/story.ts`: the timeline. `src/content/gear.ts`: the racks.
- `src/lib/site.ts`: names, links and the SoundCloud profile.

## Domain

`index.html` (canonical and share tags), `public/robots.txt` and `public/sitemap.xml` name
`https://studio.onesmall.company/`. If the domain changes, update all three.
