<!-- generated from .engineering/state.json (revision 6); edit state.json through a checkpoint, not this file -->

# one-small-studio: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: CI/CD to an evidence-backed standard
- Active task: PR #24: rebuild CI/CD (parallel jobs + gate, Firefox/WebKit, real-API contact tests, security scans, production smoke)
- Branch: claude/project-thread-wp6cz1
- Recorded commit: `3926a6d` on `claude/project-thread-wp6cz1`
- Last checkpoint: 2026-11-06T00:40:00Z by Claude Code

## Next action

Merge PR #24 after its gate passes; then post-merge verification and a follow-up record PR (docs/ci/requirements-evidence.md POST rows, checkpoint revision 7). Owner: turn on Vercel Deployment Checks for gate and add a main ruleset (docs/ci/README.md).

## Completed

- PR #24 opened on claude/project-thread-wp6cz1 (fresh from main b017cfe). CI split into static, unit, Chromium desktop and phone, Firefox and WebKit critical journeys, security (gitleaks, actionlint, zizmor, npm audit, signatures), CodeQL and one gate job
- Browser tests now run the real Express app over HTTP (server/preview.ts emulates vercel.json; Resend replaced by an in-process sink)
- Production smoke workflow (deployment_status from vercel[bot], every 6 h, dispatch) with one tracking issue; preview events observed and correctly skipped
- Independent review by a separate agent, two passes: no high findings; all medium and low findings fixed
- Requirements, evidence and score: docs/ci/requirements-evidence.md; exceptions: docs/ci/exceptions.md
- PR #21 merged by Joshua Small as 4c46d0d: acceptance record shows checks A (headers) and B (screen reader) as owner-reported tested
- Share card: public/og-image.png redrawn from scripts/og-image/card.html (npm run og:image); twitter:* tags added; src/lib/share-card.test.ts (PR #22, merged as 6268635)
- Owner-reported (Joshua Small, project thread, 2026-11-02 18:15 UTC): 'A and B were tested' (live headers check and screen reader check); no failures reported. Recorded in the acceptance record (PR #21)

## In progress

- Merge PR #24 once the gate is green, then verify the push run on main, the Vercel production deployment and the production smoke, and test the failure issue once

## Tests (agent-reported)

- `npm run format:check && npm run lint && npm run check`: pass, 2026-11-06T00:30:00Z
- `npm test (75)`: pass, 2026-11-06T00:30:00Z
- `Playwright Chromium desktop + phone (125 passed, 9 skipped), local`: pass, 2026-11-05T19:40:00Z
- `npm run smoke and smoke:browser against local server/preview.ts`: pass (11 ok, 1 external warning; 4 browser), 2026-11-06T00:15:00Z
- `GitHub CI on PR #24 (all jobs + gate)`: pass at `eb6e355`, 2026-11-06T00:26:39Z

## Unverified changes

- Production smoke has not yet run against production (sandbox cannot reach the site; first run comes from the merge deployment)
- Failure-issue notification path not yet observed
- Firefox and WebKit run only in CI; not run locally
- Production headers and screen reader behavior: owner-reported tested by Joshua Small (2026-11-02); not run or observed by an agent
- Owner-reported (Joshua Small, 2026-11-02): music plays in production; contact emails arrive
