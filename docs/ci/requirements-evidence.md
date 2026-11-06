# CI/CD requirements and evidence

Written before implementation (2026-11-05) from discovery on `main` at `b017cfe`, then filled in
with evidence. Each row has a fixed acceptance condition, a status (PASS, FAIL, BLOCKED, N/A) and
the evidence that supports it, bound to a commit, CI run or deployment. Documentation alone earns
no execution or enforcement credit.

Status key: **PASS** shown by a check that ran; **FAIL** ran and did not meet the condition;
**BLOCKED** needs a credential, platform feature or owner action this agent does not have;
**N/A** does not apply, with the reason.

## Discovery baseline (before this work)

| Fact                | Observed                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default branch      | `main` at `b017cfe` (PR #23), no open PRs, `main` **not protected** (GitHub branches API `protected: false`)                                               |
| CI                  | One workflow, one job `verify`: format, lint, types, unit/API, build, Chromium install, Playwright (desktop + Pixel 7, both Chromium)                      |
| CI timing (run #79) | 1m43s wall, 4s queue, 1m38s job: `npm ci` 8s, lint+types 9s, unit 1s, build 1s, Chromium install 21s, browser tests 48s (includes a second `vite build`)   |
| Workflow hardening  | No `permissions`, no timeouts, actions pinned to tags (`@v4`), credentials persisted, PR and `main` runs both cancelled on supersede, no artifacts         |
| Security validation | None in CI. `npm audit`: 0 vulnerabilities locally                                                                                                         |
| Browser tests       | Run against `vite preview`, which sends `vercel.json`'s global headers but has **no API**: every contact test mocks `/api/contact` with route interception |
| Production          | Vercel project `one-small-studio` (Hobby), Git integration, production on every `main` push, Node 24.x; CI used Node 22                                    |
| Production gate     | None: Vercel promotes a `main` build as soon as it is ready, whether or not CI passed                                                                      |
| Production checks   | No smoke workflow, no scheduled check, no failure notification beyond Vercel's own build-failure email                                                     |
| Architecture        | `api/index.ts` exports the same Express `app` that `server/dev.ts` serves locally, so production, dev and the API tests share one contact implementation   |

## Rubric (fixed, 100 points)

| Category                                                 | Points |
| -------------------------------------------------------- | -----: |
| A. Meaningful application, API and browser validation    |     25 |
| B. Deployment gating, production verification, recovery  |     20 |
| C. Workflow and application security validation          |     20 |
| D. Accessibility, compatibility and performance coverage |     15 |
| E. Merge enforcement and operational reliability         |     10 |
| F. Speed, diagnostics and maintainability                |     10 |

Scoring rule: a row's points are earned only at PASS. N/A rows give their points to the other rows
of the category in proportion. BLOCKED and FAIL earn nothing.

## Requirements

### A. Application, API and browser validation (25)

| ID  | Requirement and acceptance condition                                                                                                                                                           | Pts |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --: |
| A1  | Browser tests run against the production build, served once per job with no second build                                                                                                       |   3 |
| A2  | Contact form talks over real HTTP to the real Express app (same `app` Vercel runs), with only the email provider replaced by a controlled sink                                                 |   5 |
| A3  | Contact API cases: valid, invalid, empty, oversized, malformed, wrong content type, wrong method, cross-origin, rate limit, spoofed forwarding header, provider reject/timeout/network failure |   4 |
| A4  | Browser contact journeys: validation, success, provider failure keeps the message and recovers, duplicate submit sends once, rate limit message                                                |   4 |
| A5  | Player journeys: no autoplay, play/pause, repeated toggles, track change, album change, keyboard and focus continuity                                                                          |   3 |
| A6  | SoundCloud resilience: blocked script, never-ready widget, iframe failure, metadata failure, slow start then recovery, album switch during load, listener cleanup on unmount                   |   3 |
| A7  | Unknown routes, external links, canonical and share metadata are asserted                                                                                                                      |   2 |
| A8  | Hostile text from SoundCloud metadata is rendered as text and cannot run script                                                                                                                |   1 |

### B. Deployment gating, production verification and recovery (20)

| ID  | Requirement and acceptance condition                                                                                                                        | Pts |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --: |
| B1  | Production is not served until the merged commit's CI gate passes (Vercel Deployment Checks on the `CI / gate` check)                                       |   5 |
| B2  | A smoke workflow runs after each successful production deployment, accepting only Vercel's own Production deployment events                                 |   3 |
| B3  | Smoke waits until production serves the deployment's commit SHA (bounded), then checks pages, assets, headers, redirects, metadata, API and browser runtime |   4 |
| B4  | A scheduled smoke runs as detection (not prevention) and a dispatch runs it on demand                                                                       |   2 |
| B5  | Failures notify through a mechanism whose delivery was observed, without alert storms                                                                       |   3 |
| B6  | Rollback procedure is documented and the smoke tells app failures apart from SoundCloud outages                                                             |   3 |

### C. Workflow and application security validation (20)

| ID  | Requirement and acceptance condition                                                                                           | Pts |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | --: |
| C1  | Every action pinned to a full commit SHA; Dependabot keeps actions and npm current                                             |   3 |
| C2  | Least-privilege `permissions`, `persist-credentials: false`, timeouts on every job                                             |   3 |
| C3  | Workflow linting (actionlint) and dangerous-pattern audit (zizmor) run in CI and pass                                          |   3 |
| C4  | Secret scanning of the candidate tree runs in CI                                                                               |   2 |
| C5  | Dependency vulnerability audit and registry signature check run in CI with no blanket exclusions                               |   3 |
| C6  | Static analysis (CodeQL, JavaScript/TypeScript and Actions) runs on every PR and `main`                                        |   2 |
| C7  | Security headers, CSP, caching and redirects are tested in CI and in production smoke; CSP reviewed with no new unsafe sources |   2 |
| C8  | Untrusted input (PR metadata, dispatch inputs, deployment URLs) never reaches a shell or a fetch; no production secrets in CI  |   2 |

### D. Accessibility, compatibility and performance (15)

| ID  | Requirement and acceptance condition                                                                                                                    | Pts |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --: |
| D1  | axe WCAG 2.2 A/AA on representative states: idle, loading, playing, unavailable, contact errors, contact failure, reduced motion, rack power off, phone |   3 |
| D2  | Keyboard behavior: skip link moves focus, visible focus indicator, focus moves to the first invalid field, focus stays on controls after use            |   2 |
| D3  | Reflow at 320 CSS px and 200% text without horizontal scrolling; no autoplay; animations can be paused                                                  |   2 |
| D4  | Critical journeys pass in Firefox and WebKit as well as Chromium, in PR CI                                                                              |   3 |
| D5  | Asset budgets (JS, CSS, images, fonts) enforced as a gate                                                                                               |   2 |
| D6  | Layout shift, third-party loading, lazy media, failed requests and long loading states asserted                                                         |   2 |
| D7  | Manual screen reader, zoom, audio and physical-device review is recorded as manual, not claimed                                                         |   1 |

### E. Merge enforcement and operational reliability (10)

| ID  | Requirement and acceptance condition                                                                                                                                     | Pts |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --: |
| E1  | `main` requires a PR and the `gate` check, up to date with `main`                                                                                                        |   4 |
| E2  | Force pushes and deletion of `main` blocked; no bypass actors                                                                                                            |   2 |
| E3  | The final gate fails on any failed, cancelled or unexpectedly skipped job, validates its one allowed skip, and runs on every change (docs included) and on `merge_group` |   3 |
| E4  | The merged revision is validated on `main` (push run on the merge commit)                                                                                                |   1 |

### F. Speed, diagnostics and maintainability (10)

| ID  | Requirement and acceptance condition                                                                          | Pts |
| --- | ------------------------------------------------------------------------------------------------------------- | --: |
| F1  | PR wall clock under about 5 minutes, measured before and after; duplicate build removed                       |   3 |
| F2  | Fast checks fail first (separate static and unit jobs)                                                        |   2 |
| F3  | Playwright report, traces, screenshots and server log kept on failure, bounded retention, synthetic data only |   2 |
| F4  | Flaky tests fail the run instead of passing on retry                                                          |   1 |
| F5  | Every CI command runs locally through a package script; pipeline, triage and recovery documented              |   2 |

## Evidence

Bound to PR #24 at `101b9de` (CI run [#87](https://github.com/WasteOfADrumBum/one-small-studio/actions/runs/42137739498), all jobs and gate green) unless a row says
otherwise. Post-merge rows are filled in after the merge, in the follow-up record. "Local" means the
agent ran it in the development container; Firefox and WebKit run only in CI.

| ID  | Status  | Pts | Evidence                                                                                                                                                                                                                                                                                                       |
| --- | ------- | --: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | PASS    |   3 | Each Chromium job runs `npm run build` once; Playwright's `webServer` serves that `dist/` through `server/preview.ts` and never rebuilds (`playwright.config.ts`). Before: `vite build` ran twice per run                                                                                                      |
| A2  | PASS    |   5 | `e2e/contact.spec.ts` "talkback over the real API" (`@critical`, all three browsers): browser → HTTP → the `app` from `server/app.ts` (the one `api/index.ts` exports) → real Resend adapter → in-process sink, asserting exactly one delivery per tag via `/__test/mail`                                      |
| A3  | PASS    |   4 | `server/app.test.ts`: valid, invalid (it.each), empty, oversized (413), malformed JSON, `text/plain` and form bodies, GET/PUT, cross-origin 403, rate limit, spoofed `X-Forwarded-For`, separate clients, provider 4xx/5xx/timeout/network error, message never logged. 75 unit tests pass in CI               |
| A4  | PASS    |   4 | `e2e/contact.spec.ts`: validation never posts, success, sink reject keeps the message and a retry succeeds, dropped connection, double submit sends once, fourth message gets the rate-limit text                                                                                                              |
| A5  | PASS    |   3 | `e2e/journeys.spec.ts` "player": no autoplay, five toggles, next/previous keep focus, tracklist skip, switching records; `src/lib/player.test.tsx`                                                                                                                                                             |
| A6  | PASS    |   3 | `e2e/resilience.spec.ts`: blocked script (`@critical`), never-ready widget, iframe failure, oEmbed failure, slow start then recovery, switch during load hits the watchdog; `player.test.tsx`: stale album answer ignored, listeners unbound and no timers left after unmount                                  |
| A7  | PASS    |   2 | `e2e/journeys.spec.ts`: unknown route 200 with canonical `/`, unknown API path JSON 404, external links `https` + `_blank` + `noreferrer`, canonical/OG/Twitter, robots, sitemap, `version.json` commit                                                                                                        |
| A8  | PASS    |   1 | `e2e/journeys.spec.ts` XSS test: a hostile SoundCloud title renders as text and no script runs                                                                                                                                                                                                                 |
| B1  | BLOCKED |   5 | Vercel Deployment Checks are set only in the dashboard; the Vercel API this agent has does not expose them. Owner action in docs/ci/README.md and exceptions.md #6                                                                                                                                             |
| B2  | POST    |   3 | Filter proven on 5 preview deployment events (runs skipped as intended, e.g. [run 1](https://github.com/WasteOfADrumBum/one-small-studio/actions/runs/42095350394)); production trigger observed after merge                                                                                                   |
| B3  | POST    |   4 | Script passes locally against `server/preview.ts` (11 ok, 1 external warning); superseded and never-live readiness both checked locally. Production run after merge                                                                                                                                            |
| B4  | POST    |   2 | `cron: '17 */6 * * *'` and `workflow_dispatch` defined; a dispatch run is observed after merge. Documented as detection, not prevention                                                                                                                                                                        |
| B5  | POST    |   3 | One tracking issue, comments on repeat, closes on recovery, readiness label; delivery observed after merge with a dispatched failing run                                                                                                                                                                       |
| B6  | PASS    |   3 | Rollback in docs/ci/README.md and docs/DEPLOYMENT.md; SoundCloud checks are `external` (warning) and never fail the run (`scripts/smoke/smoke.mjs`, `browser.spec.ts`)                                                                                                                                         |
| C1  | PASS    |   3 | Every `uses:` is a 40-character SHA with the tag in a comment (checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2, codeql-action v4.39.3); `.github/dependabot.yml` for actions and npm                                                                                                                |
| C2  | PASS    |   3 | `permissions: {}` at the top of both workflows, per-job grants (only `security-events: write` for CodeQL and `issues: write` for the smoke notifiers), `persist-credentials: false` on every checkout, `timeout-minutes` on every job; zizmor passes                                                           |
| C3  | PASS    |   3 | actionlint 1.7.12 (with shellcheck) and zizmor 1.32.0 pass in the Security checks job. Both caught real issues during this PR (SC2016 in the old inline gate script)                                                                                                                                           |
| C4  | PASS    |   2 | gitleaks 8.30.1 scans the tree before `npm ci`; it found the public SoundCloud share tokens, which have a scoped allowance (exceptions.md #8); "no leaks found"                                                                                                                                                |
| C5  | PASS    |   3 | `npm audit --audit-level=moderate` (no allowlist) and `npm audit signatures` pass                                                                                                                                                                                                                              |
| C6  | PASS    |   2 | CodeQL JavaScript/TypeScript and Actions, security-extended, on PRs and `main`. Its four findings on this PR were fixed (anchored host matching, full escaping, in-memory fallback)                                                                                                                            |
| C7  | PASS    |   2 | `server/vercel-config.test.ts` (CSP exact `script-src`, `upgrade-insecure-requests`, caching), `e2e/security.spec.ts` (no CSP violations in three browsers), smoke checks headers, HSTS and redirect. No new CSP sources                                                                                       |
| C8  | PASS    |   2 | Inputs reach shells only through `env`; `EXPECTED_SHA` validated as 40 hex; smoke host fixed and allowlisted in both halves; the deployment URL is never read; no repository secrets used by any workflow                                                                                                      |
| D1  | PASS    |   3 | `e2e/accessibility.spec.ts` and `e2e/accessibility-states.spec.ts`: axe WCAG 2.2 A/AA idle, loading, playing, unavailable + reduced motion, contact errors, contact failure, racks off, on desktop and Pixel 7                                                                                                 |
| D2  | PASS    |   2 | Skip link test, focus-indicator check over 12 tab stops, focus to the first invalid field with its description, focus kept on transport controls                                                                                                                                                               |
| D3  | PASS    |   2 | Reflow at 320 and 390 CSS px and with 200% text (no sideways loss); no-autoplay test; reduced-motion tests                                                                                                                                                                                                     |
| D4  | PASS    |   3 | Critical journeys (`@critical`) pass in Firefox desktop and WebKit iPhone 13 jobs, plus Chromium desktop and Pixel 7                                                                                                                                                                                           |
| D5  | PASS    |   2 | `scripts/check-budgets.mjs` gates JS 252.8/280 KiB gz, CSS 64.1/72, largest image 201.6/225, fonts 388.5/430, share image 219.3/245, one JS file                                                                                                                                                               |
| D6  | PASS    |   2 | `e2e/performance.spec.ts`: CLS 0.021 desktop / 0.045 phone (limit 0.1), only allowed hosts, correct content types, lazy catalog images, self-hosted fonts, player usable under 10 s; resilience covers failed requests and long loading                                                                        |
| D7  | PASS    |   1 | Manual checks listed below, not claimed as automated                                                                                                                                                                                                                                                           |
| E1  | BLOCKED |   4 | No tool here can create a ruleset (GitHub MCP has none; `gh` is search-only in this environment). Owner action below                                                                                                                                                                                           |
| E2  | BLOCKED |   2 | Same ruleset                                                                                                                                                                                                                                                                                                   |
| E3  | PASS    |   3 | `scripts/ci/gate.mjs` + `scripts/ci/gate.test.ts` (failure, cancelled, skipped, missing, unexpected, fork CodeQL skip). Observed: gate failed on cancelled runs ([job](https://github.com/WasteOfADrumBum/one-small-studio/actions/runs/42097707310/job/127500869908)); no path filters; `merge_group` trigger |
| E4  | POST    |   1 | Push run on the merge commit, after merge                                                                                                                                                                                                                                                                      |
| F1  | PASS    |   3 | See timing below; duplicate build removed                                                                                                                                                                                                                                                                      |
| F2  | PASS    |   2 | Static job fails a lint error about 20 s in, on its own check, while the browser jobs are still running                                                                                                                                                                                                        |
| F3  | PASS    |   2 | Report, traces, screenshots uploaded on failure for 7 days (14 for smoke); `[WebServer]` log in the job log; synthetic data only. Observed on the failing WebKit run ([artifact](https://github.com/WasteOfADrumBum/one-small-studio/actions/runs/42095293325/artifacts/13447342960), 1.3 MB)                  |
| F4  | PASS    |   1 | `retries: 1` with `failOnFlakyTests` in CI                                                                                                                                                                                                                                                                     |
| F5  | PASS    |   2 | Local commands in docs/ci/README.md jobs table; `npm run verify`; triage and rollback documented                                                                                                                                                                                                               |

### Timing

|                        | Before (run #79, `b017cfe`)         | After (run #87, `101b9de`)                                                                                              |
| ---------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Wall clock             | 1m43s, one job                      | 2m32s, nine jobs in parallel                                                                                            |
| Tests run              | 43 browser (Chromium only), 47 unit | 134 Chromium (125 run, 9 skipped by design) + 10 critical each in Firefox and WebKit, 75 unit, plus security and CodeQL |
| Time to a lint failure | reported when the 1m38s job ends    | about 20 s (static job)                                                                                                 |
| Duplicate build        | `vite build` twice                  | once per browser job                                                                                                    |
| Longest job            | 1m38s                               | a Chromium suite, within the 2m32s                                                                                      |

The extra time buys three browsers, the real API path, accessibility states and security scans; it
stays under the 5-minute target.

### Manual checks (not automated)

Screen reader passes (NVDA, VoiceOver), browser zoom beyond 200%, audio actually playing on a phone
and a desktop, and the share card in real apps. Owner-reported results for the release are in
docs/release/studio-release-acceptance.md; this PR claims none of them.

### Score

| Category  |     Max | Earned now |    After post-merge rows |
| --------- | ------: | ---------: | -----------------------: |
| A         |      25 |         25 |                       25 |
| B         |      20 |          3 | 15 if all POST rows pass |
| C         |      20 |         20 |                       20 |
| D         |      15 |         15 |                       15 |
| E         |      10 |          3 |                        4 |
| F         |      10 |         10 |                       10 |
| **Total** | **100** |     **76** |                   **89** |

The 11 points left are B1 (Deployment Checks) and E1–E2 (ruleset), both one owner setting each.
