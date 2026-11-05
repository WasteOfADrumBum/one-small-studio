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

Filled in after implementation; see the table at the end of this file.
