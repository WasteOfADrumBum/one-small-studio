<!-- generated from .engineering/state.json (revision 2); edit state.json through a checkpoint, not this file -->

# one-small-studio: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: Studio release
- Active task: none recorded
- Branch: none recorded
- Recorded commit: 0c958b5
- Last checkpoint: 2026-11-02T18:20:00Z by Claude (claude.ai project thread 'Close Studio release')
- Roadmap: [ROADMAP.md](../ROADMAP.md)

## Next action

Optional post-release checks A (live headers) and B (screen reader) from docs/release/studio-release-acceptance.md; then future work from ROADMAP.md on a fresh branch off main

## Completed

- PR #19 merged as 0c958b5; CI run #69 on main green; production deployment dpl_4EpPA6p9NuYWViELPgydN18L1EVr READY, no runtime errors in its first hour (agent-observed)
- Owner-reported (Joshua Small, project thread, 2026-11-02 18:08 UTC): 'I accept these risks and approve the Studio release.' Recorded in docs/release/studio-release-acceptance.md
- Verified GitHub: main b701805, CI run #67 green, no open PRs; production deployment dpl_CGx5ftNFpkhRbt41CG7e73zW3Jd4 built from b701805
- Reconciled launch (PR #13), npm audit (PR #16) and XSS/CSP (PR #17) audits; see docs/release/studio-release-evidence.md
- Fixed: API 400/413 for malformed/oversized bodies; Resend and browser timeouts; player first-load watchdog; canonical/OG/robots/sitemap on studio.onesmall.company; minimatch advisory
- Added: asset/API cache headers, footer privacy note, WCAG 2.2 axe + resilience/keyboard/reduced-motion e2e tests
- Docs: docs/DEPLOYMENT.md, release evidence, acceptance record, ROADMAP.md (linked from README)

## In progress

_none recorded_

## Tests (agent-reported)

- `npm run format:check`: pass (2026-11-02T17:30:00Z)
- `npm run lint`: pass (2026-11-02T17:30:00Z)
- `npm run check`: pass (2026-11-02T17:30:00Z)
- `npm test`: pass (45) (2026-11-02T17:30:00Z)
- `npm run build`: pass (2026-11-02T17:30:00Z)
- `npm run test:e2e`: pass (47 passed, 5 skipped) (2026-11-02T17:30:00Z)
- `npm audit`: 0 vulnerabilities (2026-11-02T17:30:00Z)

## Unverified changes

- Production headers (HSTS, CSP, cache-control) on the live domain: not checked (sandbox cannot reach it; Josh's check A not reported)
- Real screen readers: not checked (Josh's check B not reported)
- Owner-reported (Joshua Small, 2026-11-02): music plays in production; contact emails arrive
