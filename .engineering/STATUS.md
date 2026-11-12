<!-- generated from .engineering/state.json (revision 9); edit state.json through a checkpoint, not this file -->

# one-small-studio: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: Post-release polish
- Active task: studio-pr-30: PR #30: condense the story timeline (transport row, Era/Year ruler, tracks) on phones only
- Branch: `claude/project-thread-s54c2v` · PR #30
- Recorded commit: `a0e4ed6` on `claude/project-thread-s54c2v`
- Last checkpoint: 2026-11-12T02:08:48Z by Claude Code

## Next action

Merge PR #28 after its gate passes; check its push run on main and the deployment smoke. Owner: turn on Vercel Deployment Checks for gate and add a main ruleset (docs/ci/README.md).

## Completed

- PR #30 opened: phone-only (<=48em) condensed timeline in Story.module.css; story section screenshots at 1024/1279/1440/2318 byte-identical before and after
- PR #28 merged to main as c833e03 (CI/CD in pinned Playwright image)
- PR #24 merged by Joshua Small as ad79b90 (2026-11-06 17:34 UTC): parallel CI with one gate, Firefox/WebKit critical journeys, real-API browser tests, security scans, CodeQL, production smoke
- Production deployment dpl_4wTowxZNhSNuX6xEPfEyiUuwTXR6 from ad79b90 READY; no runtime errors in the following hour (Vercel MCP)
- [withheld: possible sensitive data]
- [withheld: possible sensitive data]
- [withheld: possible sensitive data]
- PR #28: browser, cross-browser and smoke jobs run in mcr.microsoft.com/playwright:v1.63.0-noble pinned by digest; scripts/ci/playwright-image.test.ts keeps it matched to package.json.
- [withheld: possible sensitive data]
- Score recorded in docs/ci/requirements-evidence.md: 89/100; remaining 11 are two owner settings
- PR #21 merged by Joshua Small as 4c46d0d: acceptance record shows checks A (headers) and B (screen reader) as owner-reported tested
- Share card: public/og-image.png redrawn from scripts/og-image/card.html (npm run og:image); twitter:* tags added; src/lib/share-card.test.ts (PR #22, merged as 6268635)
- Owner-reported (Joshua Small, project thread, 2026-11-02 18:15 UTC): 'A and B were tested' (live headers check and screen reader check); no failures reported. Recorded in the acceptance record (PR #21)

## In progress

- PR #28 waiting for its gate on the evidence commit, then merge

## Tests (agent-reported)

- `format:check, lint, vitest (79), budgets, playwright desktop+phone (125 passed, 9 skipped)`: pass at `a0e4ed6`, 2026-11-06T23:45:00Z
- `npm run format:check (prettier) && npm run lint && tsc --noEmit`: pass at `1f8a7e7`, 2026-11-06T17:47:00Z
- `vitest run scripts/ci (10, incl. playwright-image)`: pass at `1f8a7e7`, 2026-11-06T17:47:26Z
- `GitHub CI on PR #28 (all jobs + gate)`: pass at `1f8a7e7`, 2026-11-06T17:52:47Z
- `GitHub CI push on main ad79b90 (attempt 1 fail (browser install), attempt 2 pass)`: pass at `ad79b90`, 2026-11-06T17:58:00Z
- `Production smoke (deployment_status) (pass (13 ok; 4 browser))`: pass at `ad79b90`, 2026-11-06T17:37:28Z
- `Production smoke (dispatch, never-live SHA, expected failure) (fail as intended; issue #29 opened)`: fail at `ad79b90`, 2026-11-06T17:50:16Z
- `Production smoke (dispatch, ad79b90) (pass; issue #29 closed)`: pass at `ad79b90`, 2026-11-06T17:51:41Z
- `Production smoke (schedule)`: pass at `ad79b90`, 2026-11-06T18:24:00Z
- `Production smoke (dispatch from PR #28 branch, inside the Playwright container)`: pass at `9ad513a`, 2026-11-06T18:28:31Z

## Unverified changes

- Email delivery of the smoke issue depends on the owner's GitHub notification settings; only the issue itself was observed
- Firefox and WebKit run only in CI; not run locally
- Production headers and screen reader behavior: owner-reported tested by Joshua Small (2026-11-02); not run or observed by an agent
- Owner-reported (Joshua Small, 2026-11-02): music plays in production; contact emails arrive
