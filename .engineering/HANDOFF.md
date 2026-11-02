<!-- generated from .engineering/state.json (revision 5) -->

# Handoff: one-small-studio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 5, `ckpt-0005-contract-v1-shape`, 2026-11-02T23:10:00Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

The Studio release is approved, live and its checks are owner-reported done; the new share card (PR #22) is merged. Next work comes from ROADMAP.md on a fresh branch off main. Checkpoint re-recorded in the continuity contract v1 shape (the previous revision failed hub validation and showed as invalid in the hub aggregate); content carried over, nothing new claimed.

## Unfinished

_none recorded_

## Blockers

- Release version number not chosen (owner)

## Decisions

- [human] No MongoDB: contact messages are emailed through Resend (Joshua Small, PR #14)
- [human] No admin page; content lives in code (Joshua Small, 2026-10-26)
- [agent] Canonical public address is https://studio.onesmall.company/ (the vercel.app address is behind Vercel Authentication)
- [human] Studio release approved by Joshua Small (owner-reported; recorded by the agent, not approved by it) (Joshua Small, project thread "Close Studio release", 2026-11-02 18:08 UTC)

## Constraints

- Free tiers only; no paid services or billing changes
- No redesign, new music or commercial features in the Studio release
- Any new third-party host must be added to the CSP in vercel.json
- Production redeploys and release approval belong to Joshua Small
- Roadmap: ROADMAP.md

## Unresolved decisions

- Whether one-small-studio.vercel.app should be public (ROADMAP item 3)
- Release version number (owner decision)
