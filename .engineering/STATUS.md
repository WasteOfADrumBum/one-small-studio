<!-- generated from .engineering/state.json (revision 3); edit state.json through a checkpoint, not this file -->

# one-small-studio: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: Studio release
- Active task: Share card (Open Graph/Twitter image) redrawn as a rack faceplate
- Branch: claude/project-thread-3pyuj4 (PR #22)
- Recorded commit: 9310334
- Last checkpoint: 2026-11-02T18:25:00Z by Claude (claude.ai project thread 'Make Studio share card image')
- Roadmap: [ROADMAP.md](../ROADMAP.md)

## Next action

Josh reviews and merges PR #22; after deploy, re-scrape https://studio.onesmall.company/ in a share debugger to refresh cached previews

## Completed

- Share card: public/og-image.png redrawn from scripts/og-image/card.html (npm run og:image); twitter:* tags added; src/lib/share-card.test.ts (PR #22, open)
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

- `npm run format:check`: pass (2026-11-02T18:25:00Z)
- `npm run lint`: pass (2026-11-02T18:25:00Z)
- `npm run check`: pass (2026-11-02T18:25:00Z)
- `npm test`: pass (47) (2026-11-02T18:25:00Z)
- `npm run build`: pass (2026-11-02T18:25:00Z)
- `npm run test:e2e`: pass (43 passed, 5 skipped) (2026-11-02T18:25:00Z)

## Unverified changes

- Production headers (HSTS, CSP, cache-control) on the live domain: not checked (sandbox cannot reach it; Josh's check A not reported)
- Real screen readers: not checked (Josh's check B not reported)
- Owner-reported (Joshua Small, 2026-11-02): music plays in production; contact emails arrive
- New share card as rendered by Facebook/X/Slack/iMessage: not checked (sandbox cannot reach the live site)
