# Studio release: evidence

Release scope: the current One Small Studio site as built through PR #18, plus the release-closure
fixes in this PR. No redesign, no new music, no commercial features.

Evidence types used below, so nothing is claimed beyond what was done:

- **Automated**: a test or check in this repo, run by the agent and by CI.
- **Agent-observed**: the agent read it from GitHub, Vercel or Resend through an authenticated
  tool on 2026-11-02. Not independently verified.
- **Owner-reported**: Joshua Small said so in the project thread. Recorded as his report, not
  re-tested.
- **Open**: not established yet; listed in the acceptance record.

## Baseline (agent-observed, 2026-11-02)

| Item                    | State                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `main` head             | `b701805` (merge of PR #17). No open pull requests                                                                |
| CI on `main`            | Run #67 passed (format, lint, types, unit, build, e2e)                                                            |
| Production deployment   | `dpl_CGx5ftNFpkhRbt41CG7e73zW3Jd4`, READY, built from `b701805`; marked rollback candidate                        |
| Earlier rollback target | `dpl_HfBjqutrMWJrL54bdCkL5W5YSnA9` (`ea33857`), READY                                                             |
| Domains                 | `studio.onesmall.company`, `one-small-studio.vercel.app` (+ two generated Vercel aliases)                         |
| Deployment protection   | Vercel Authentication on every deployment except custom domains                                                   |
| Vercel env vars         | `RESEND_API_KEY`, `CONTACT_TO` (both Sensitive), `CONTACT_FROM`; all Production only. No `MONGODB_URI`            |
| Vercel runtime errors   | Last 7 days: one, on 2026-10-27 (Resend 403 before the domain was verified). None since                           |
| Resend                  | Free tier: 100/day, 3,000/month caps; 5 sent this month. `onesmall.company` verified; open and click tracking off |

## Audit reconciliation

| Audit                             | Finding then                                            | Status now                                                                                 |
| --------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Launch audit, 2026-10-26 (PR #13) | Contact form needed `MONGODB_URI` and had no inbox      | Superseded: PR #14 emails via Resend; Mongo removed. Delivery **owner-reported** working   |
|                                   | No admin page                                           | Closed by Josh's decision: no admin; content lives in code                                 |
|                                   | Estimated timeline years                                | Closed in PR #14 with Josh's real years; "c. 1999" for the first kit is his own wording    |
|                                   | Footer links blank                                      | Closed in PR #14                                                                           |
|                                   | Private SoundCloud tokens public in repo                | Accepted risk (unavoidable while the site plays them). Recorded in the acceptance record   |
|                                   | Share tags, robots, sitemap on the `vercel.app` address | **Fixed here**: now `studio.onesmall.company`, which is the public custom domain           |
|                                   | Live playback untested                                  | **Owner-reported** working in production                                                   |
|                                   | Screen reader passes not done                           | Still open (manual). In the acceptance record                                              |
| npm audit, PR #16                 | Two high advisories                                     | Closed. One new moderate (minimatch, dev-only via ESLint) **fixed here** with an override  |
| XSS audit, PR #17                 | No sinks; CSP and headers added                         | Holds. CSP tests still pass; no new third-party hosts added                                |
| Accessibility (WCAG)              | axe at 2.1 AA, zero violations                          | **Raised here** to 2.2 AA tags, plus a second pass with reduced motion and SoundCloud down |

## Release-closure findings

Confirmed defects (fixed in this PR, each with a test):

1. Malformed JSON or an oversized body on `/api/contact` returned 500 and logged a crash. Now 400 /
   413 with no log noise; body limit cut from 1 MB to 16 KB. (`server/app.test.ts`)
2. If SoundCloud never answered on first load (blocked or stalled), the player stayed on
   "Loading" forever; only album switches had a timeout. Now it falls back to "SoundCloud is not
   answering" with a link after 15 s, and recovers if SoundCloud answers late.
   (`src/lib/player.test.tsx`, `e2e/resilience.spec.ts`)
3. No timeout on the Resend call or the browser's POST: a stalled connection hung the form. Now 8 s
   server-side, 20 s in the browser, each ending in the existing friendly error.
4. Canonical URL, share image, robots and sitemap pointed at `one-small-studio.vercel.app`, which is
   behind Vercel Authentication per the project's protection setting (`all_except_custom_domains`),
   so crawlers and link previews may get a login wall. Moved to `studio.onesmall.company`.
5. `npm audit`: minimatch < 11.0.1 (moderate, ReDoS, dev tooling only). Overridden to 11.0.4;
   `npm audit` reports 0.

Gaps closed (not defects):

- Hashed `/assets/*` now cache for a year as immutable; `/api/*` is `no-store`.
- Privacy note in the footer naming the real third parties: SoundCloud's embedded player (with a
  link to its policy), Resend for talkback email, Vercel hosting logs. The site itself sets no
  cookies and runs no analytics (checked: no cookie writes, only `localStorage` for the motion
  switch).
- New tests for keyboard play/pause, a dropped connection and a rate-limited send on the talkback
  form, and reduced motion (no looping animation runs; a control check confirmed 56 run when motion
  is allowed).
- `docs/DEPLOYMENT.md` documents setup, env vars, headers, contact protection, monitoring, billing
  caps and rollback. `ROADMAP.md` holds future work.

Reviewed and found sound (no change):

- Contact abuse protection: same-origin check, honeypot, zod validation, 3/hour per hashed IP,
  Resend's daily cap as the backstop. The in-memory limit resets on cold start; accepted for a
  hobby site and listed in the roadmap.
- Contact errors: visitors never see Resend's answer; logs keep it. Message bodies are not logged.
- Secrets: pattern scan of all 70 commits in history (Resend, AWS, GitHub, Stripe, Slack, Vercel
  tokens, Mongo URIs with passwords, private keys) found nothing; no `.env` file was ever
  committed. Only intentional SoundCloud secret tokens are public.
- Keyboard: skip link, timeline arrows, jog wheel, volume knob, rack switches and now the
  transport all have keyboard tests.
- Reduced motion: honored in CSS and in Motion/GSAP (`useReducedMotion`), plus the footer pause
  switch.

## Automated results (this branch)

Run by the agent in the sandbox on 2026-11-02; CI reruns them on the PR.

| Check                  | Result                                            |
| ---------------------- | ------------------------------------------------- |
| `npm run format:check` | pass                                              |
| `npm run lint`         | pass                                              |
| `npm run check`        | pass                                              |
| `npm test`             | 45 passed                                         |
| `npm run build`        | pass (one 824 KB JS chunk; see roadmap)           |
| `npm run test:e2e`     | 47 passed, 5 skipped (desktop-only or phone-only) |
| `npm audit`            | 0 vulnerabilities                                 |

## Not verified by the agent

- Production response headers (HSTS, CSP, cache) on the live domain: the sandbox's network cannot
  reach the site. The command to check is in the acceptance record.
- Whether `one-small-studio.vercel.app` actually shows a login wall to the public.
- Real SoundCloud behavior beyond Josh's report; real screen readers; Vercel's plan tier (the
  API did not report it).
