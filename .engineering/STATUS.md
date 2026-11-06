<!-- generated from .engineering/state.json (revision 8); edit state.json through a checkpoint, not this file -->

# one-small-studio: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: Post-release polish
- Active task: PR #30: condense the story timeline on phones only
- Branch: claude/project-thread-s54c2v
- Recorded commit: `a0e4ed6` on `claude/project-thread-s54c2v`
- Last checkpoint: 2026-11-06T23:45:00Z by Claude Code

## Next action

Check PR #30's gate and Joshua Small's review of the phone timeline.

## Completed

- PR #24 merged by Joshua Small as ad79b90 (2026-11-06 17:34 UTC): parallel CI with one gate, Firefox/WebKit critical journeys, real-API browser tests, security scans, CodeQL, production smoke
- Production deployment dpl_4wTowxZNhSNuX6xEPfEyiUuwTXR6 from ad79b90 READY; no runtime errors in the following hour (Vercel MCP)
- Production smoke from the deployment event passed: 13 ok, 0 failed; browser 4 passed (run 42262992396). First scheduled run passed (42270297999)
- Failure path observed: dispatch with a never-live SHA opened issue #29 with the readiness label (42265174080); a passing dispatch closed it (42265321855)
- Push CI on ad79b90: attempt 1 failed in Install Chromium (apt hung, no test ran), attempt 2 green (42262920215)
- PR #28: browser, cross-browser and smoke jobs run in mcr.microsoft.com/playwright:v1.63.0-noble pinned by digest; scripts/ci/playwright-image.test.ts keeps it matched to package.json. CI jobs green in the container (42265165091); smoke job green in the container from a dispatch on the PR branch against production (42270867413)
- Score recorded in docs/ci/requirements-evidence.md: 89/100; remaining 11 are two owner settings
- PR #21 merged by Joshua Small as 4c46d0d: acceptance record shows checks A (headers) and B (screen reader) as owner-reported tested
- Share card: public/og-image.png redrawn from scripts/og-image/card.html (npm run og:image); twitter:* tags added; src/lib/share-card.test.ts (PR #22, merged as 6268635)
- Owner-reported (Joshua Small, project thread, 2026-11-02 18:15 UTC): 'A and B were tested' (live headers check and screen reader check); no failures reported. Recorded in the acceptance record (PR #21)

## In progress

- PR #28 waiting for its gate on the evidence commit, then merge

## Tests (agent-reported)

- `npm run format:check (prettier) && npm run lint && tsc --noEmit`: pass at `1f8a7e7`, 2026-11-06T17:47:00Z
- `vitest run scripts/ci (10, incl. playwright-image)`: pass at `1f8a7e7`, 2026-11-06T17:47:26Z
- `GitHub CI on PR #28 (all jobs + gate)`: pass at `1f8a7e7`, 2026-11-06T17:52:47Z
- `GitHub CI push on main ad79b90`: attempt 1 fail (browser install), attempt 2 pass at `ad79b90`, 2026-11-06T17:58:00Z
- `Production smoke (deployment_status)`: pass (13 ok; 4 browser) at `ad79b90`, 2026-11-06T17:37:28Z
- `Production smoke (dispatch, never-live SHA, expected failure)`: fail as intended; issue #29 opened at `ad79b90`, 2026-11-06T17:50:16Z
- `Production smoke (dispatch, ad79b90)`: pass; issue #29 closed at `ad79b90`, 2026-11-06T17:51:41Z
- `Production smoke (schedule)`: pass at `ad79b90`, 2026-11-06T18:24:00Z
- `Production smoke (dispatch from PR #28 branch, inside the Playwright container)`: pass at `9ad513a`, 2026-11-06T18:28:31Z

## Unverified changes

- Email delivery of the smoke issue depends on the owner's GitHub notification settings; only the issue itself was observed
- Firefox and WebKit run only in CI; not run locally
- Production headers and screen reader behavior: owner-reported tested by Joshua Small (2026-11-02); not run or observed by an agent
- Owner-reported (Joshua Small, 2026-11-02): music plays in production; contact emails arrive
