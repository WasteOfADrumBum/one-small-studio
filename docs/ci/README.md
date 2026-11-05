# CI/CD: how changes are checked, shipped and watched

Requirements, acceptance conditions, evidence and the score: [requirements-evidence.md](requirements-evidence.md).
Justified exceptions: [exceptions.md](exceptions.md). Hosting, environment variables and rollback
detail: [../DEPLOYMENT.md](../DEPLOYMENT.md).

## The path of a change

```
PR ──► CI (.github/workflows/ci.yml) ──► gate ✔ ──► merge to main ──► CI on the merge commit
                                                                         │
                         Vercel builds production ◄──────────────────────┘ (in parallel)
                         and, with Deployment Checks on, serves it only once "gate" passes
                                                                         │
                         Production smoke (.github/workflows/smoke.yml) ◄┘ deployment_status
                         + every 6 h + on demand
```

## CI jobs

All run in parallel on every pull request, every push to `main`, merge-queue groups and manual
dispatch. There are no path filters, so a docs-only change runs (and passes) the same gate and no
required check is ever left pending.

| Job                                       | What it proves                                                                                                                                                                                 | Local command                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Format, lint, types                       | Prettier, ESLint, `tsc`                                                                                                                                                                        | `npm run format:check && npm run lint && npm run check`                                                             |
| Unit and API tests                        | Vitest: player logic, content, contact schema, the Express API with Resend mocked, vercel.json emulation                                                                                       | `npm test`                                                                                                          |
| Build and browser tests (Chromium)        | One `vite build`, asset budgets, then every Playwright test on desktop 1440px and Pixel 7 against that build                                                                                   | `npm run test:e2e` (builds first)                                                                                   |
| Critical journeys (firefox, webkit-phone) | The `@critical` tests in Firefox desktop and WebKit on iPhone 13                                                                                                                               | `npm run build && npx playwright install firefox webkit && npm run e2e -- --project=firefox --project=webkit-phone` |
| Security checks                           | gitleaks (secrets in the tree), actionlint, zizmor (dangerous workflow patterns), `npm audit --audit-level=moderate`, `npm audit signatures`                                                   | `npm audit --audit-level=moderate && npm audit signatures`; the three tools need installing (versions in ci.yml)    |
| CodeQL                                    | Static analysis, JavaScript/TypeScript and Actions, security-extended queries; results in the Security tab                                                                                     | GitHub only                                                                                                         |
| **gate**                                  | Passes only if every job above succeeded. Fails on failure, cancellation, a missing job or an unexpected skip. The one allowed skip is CodeQL on a fork PR (fork tokens cannot upload results) | n/a                                                                                                                 |

`npm run verify` runs the local equivalent of the Chromium path in one go.

### What the browser tests run against

`server/preview.ts` serves `dist/` the way Vercel does: static files first, then the rewrites in
`vercel.json`, every response with the headers `vercel.json` gives its path, and `/api/*` handed
to the same Express `app` that `api/index.ts` exports to Vercel. So the talkback tests exercise
browser → HTTP → real route → real Resend adapter. Only the provider is replaced: an in-process
sink (`server/testing/mail-sink.ts`) answers in Resend's place, and the server overwrites the
mail settings with dummy values so no real email can be sent even with real keys present.
`server/vercel-config.ts` refuses vercel.json patterns it cannot emulate, so the test server can't
silently drift from the config.

Known differences from production (covered by the production smoke instead): no HTTPS, HSTS or
HTTP→HTTPS redirect, and the CSP's `upgrade-insecure-requests` is dropped (WebKit would otherwise
rewrite every localhost asset to HTTPS; the unit tests and the smoke assert production keeps it); no compression; one long-lived process (Vercel's cold starts reset the
in-memory rate limit); the client address is whatever `X-Forwarded-For` a test sends (Vercel
overwrites that header with the real client address).

SoundCloud is a deterministic stub (`e2e/fixtures.ts`). It proves the site drives the Widget API
correctly. It does not prove SoundCloud is reachable (the smoke check reports that as an
external warning) or that audio plays on a device (manual).

### Flakes, retries and diagnostics

- CI retries a failed test once to classify it, and `failOnFlakyTests` fails the run when a test
  only passed on retry. Flakes are reported, never absorbed.
- On failure the job uploads `playwright-report/` and `test-results/` (traces, screenshots, error
  context) for 7 days. The server's own log is in the job log, prefixed `[WebServer]`.
- Test data is synthetic (`Sam Synthetic`, `example.com`, `sink.invalid`); no cookies, credentials
  or real messages are involved, so artifacts hold nothing sensitive.

### Timing (measured)

|                        | Before (run #79, `b017cfe`)                                | After (this PR, final run)                                               |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| Wall clock             | 1m43s, one job                                             | see requirements-evidence.md                                             |
| Time to a lint failure | ~20s into a 1m38s job, but reported only when the job ends | static job alone                                                         |
| Duplicate work         | `vite build` twice (CI step + Playwright webServer)        | built once per browser job (build is ~2s; moving an artifact costs more) |
| Browser suite          | 48s incl. a rebuild                                        | see requirements-evidence.md                                             |

## Production

- Vercel builds every push to `main`. Turn on **Deployment Checks** for the `gate` check
  (Vercel → Project → Settings → Deployment Checks) so a production build is served only after
  CI passes on that commit. Until then, production goes live when the build is ready and CI runs
  alongside it; the smoke check then detects problems after the fact.
- `dist/version.json` and `/api/health` report the commit (`VERCEL_GIT_COMMIT_SHA`), so checks
  can tell which build is live. `/api/health` also says whether the talkback mail settings are
  present (`contact: configured`), without revealing them.

### Production smoke (`.github/workflows/smoke.yml`)

Triggers: Vercel's `deployment_status` events (only `success`, environment `Production`, created
by `vercel[bot]`), every 6 hours, and manual dispatch with an optional commit SHA. It always tests
the fixed address `https://studio.onesmall.company`; the URL in the event is never fetched, and
the script refuses any other host.

It waits (up to 10 minutes) until `/version.json` reports the expected commit, then checks: page
and title, security headers and HSTS, HTTP→HTTPS redirect, canonical/OG/Twitter metadata, every
built asset's status, type and caching, robots/sitemap/share image/icon, the SPA fallback,
`/api/health` (commit and talkback wiring), the JSON 404, an invalid talkback POST (400, rejected
by validation before any email code runs) and a cross-site POST (403). A browser pass loads the
site with SoundCloud blocked (fallback link must work, no script errors) and with live SoundCloud
(records whether the player came up and the load/LCP timing as a trend, without failing on
SoundCloud's state).

App failures fail the run. SoundCloud being unreachable is an **external warning**.

### When the production smoke fails

A failing run opens one issue labelled `production-smoke` (later failures comment on it; a later
passing run closes it). GitHub notifies the repository owner of new issues by default.

1. Open the run from the issue; the job summary lists each check.
2. App check failed right after a deploy: roll back (below), then fix forward with a PR.
3. Only the readiness check failed: production is not serving the merged commit. Check the Vercel
   deployment (build error, or held by Deployment Checks because CI failed on `main`).
4. External warning only: SoundCloud is down or blocking; nothing to roll back.

## Rollback

- Fastest: Vercel → Project → Deployments → last good production deployment → **Instant
  Rollback**. Or `npx vercel rollback <deployment-url> --scope task-forge3`. After a rollback,
  Vercel stops auto-assigning production domains until you promote a deployment again
  (`npx vercel promote <url> --scope task-forge3`).
- Code: `git revert -m 1 <merge-commit>` on a branch, PR, merge. Never force-push `main`.
- Then dispatch the smoke workflow with the expected SHA to confirm.

## Maintenance

- Actions are pinned to full commit SHAs with the release tag in a comment; Dependabot proposes
  bumps weekly (`.github/dependabot.yml`), and they pass the same gate.
- actionlint, gitleaks and zizmor versions are pinned in `ci.yml` and bumped by hand.
- Playwright is pinned (`@playwright/test` and `playwright-core` 1.63.0) to match the browser
  build in the cloud dev environment; Dependabot ignores it. Bump both together.
- Asset budgets live in `scripts/check-budgets.mjs`; raise one only with a reason in the PR.
- Any new third-party host must be added to the CSP in `vercel.json`, to `ALLOWED_HOSTS` in
  `e2e/performance.spec.ts`, and to the CSP assertions in `server/vercel-config.test.ts`.
