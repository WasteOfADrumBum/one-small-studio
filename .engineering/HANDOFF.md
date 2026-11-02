<!-- generated from .engineering/state.json (revision 3) -->

# Handoff: one-small-studio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 3, `ckpt-0003-9310334`, 2026-11-02T18:20:00Z by Claude (claude.ai project thread 'Close Studio release')
- Written by: an agent commit (hand-edited by the schema; the hub CLI was not reachable)
- Uncommitted work outside this checkpoint: **none**
- Roadmap: [ROADMAP.md](../ROADMAP.md) · Acceptance record: [docs/release/studio-release-acceptance.md](../docs/release/studio-release-acceptance.md)

## Continue with

The Studio release is approved, live and its checks are owner-reported done. Next work comes from ROADMAP.md on a fresh branch off main.

## Unfinished

_none recorded_

## Blockers

_none recorded_

## Decisions

- No MongoDB: contact messages are emailed through Resend (Josh, PR #14)
- No admin page; content lives in code (Josh, 2026-10-26)
- Canonical public address is https://studio.onesmall.company/ (agent, this release; vercel.app address is behind Vercel Authentication)
- Studio release approved by Joshua Small, 2026-11-02 (owner-reported; recorded by the agent, not approved by it)

## Constraints

- Free tiers only; no paid services or billing changes
- No redesign, new music or commercial features in the Studio release
- Any new third-party host must be added to the CSP in vercel.json
- Production redeploys and release approval belong to Joshua Small
- Roadmap: ROADMAP.md

## Unresolved decisions

- Whether one-small-studio.vercel.app should be public (ROADMAP item 3)
