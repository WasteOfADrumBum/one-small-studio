<!-- generated from .engineering/state.json (revision 1) -->

# Handoff: one-small-studio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 1, `ckpt-0001-f49229f`, 2026-11-02T17:30:00Z by Claude (claude.ai project thread 'Close Studio release')
- Written by: an agent commit on `claude/project-thread-kuu29p` (hand-edited by the schema; the hub CLI was not reachable)
- Uncommitted work outside this checkpoint: **none**
- Roadmap: [ROADMAP.md](../ROADMAP.md) · Acceptance record: [docs/release/studio-release-acceptance.md](../docs/release/studio-release-acceptance.md)

## Continue with

Read docs/release/studio-release-acceptance.md. If Josh reports a failed check, fix on a fresh branch off main. Otherwise take the next item from ROADMAP.md.

## Unfinished

- Release PR review/merge and production deploy (Josh)
- Acceptance checks A-C and sign-off (Josh)

## Blockers

- Release approval belongs to Joshua Small

## Decisions

- No MongoDB: contact messages are emailed through Resend (Josh, PR #14)
- No admin page; content lives in code (Josh, 2026-10-26)
- Canonical public address is https://studio.onesmall.company/ (agent, this release; vercel.app address is behind Vercel Authentication)

## Constraints

- Free tiers only; no paid services or billing changes
- No redesign, new music or commercial features in the Studio release
- Any new third-party host must be added to the CSP in vercel.json
- Production redeploys and release approval belong to Joshua Small
- Roadmap: ROADMAP.md

## Unresolved decisions

- Whether one-small-studio.vercel.app should be public (ROADMAP item 3)
