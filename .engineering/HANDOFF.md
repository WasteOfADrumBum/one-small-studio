<!-- generated from .engineering/state.json (revision 7) -->

# Handoff: one-small-studio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 7, `ckpt-0007-cicd-post-merge`, 2026-11-06T18:30:00Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

CI/CD is in place (docs/ci/README.md, docs/ci/requirements-evidence.md, score 89). Check PR #28 on GitHub: if merged, confirm the push run on main and the Production smoke run from that deployment are green. The remaining points need the two owner settings in handoff.blockers.

## Unfinished

- Merge PR #28, then check its push run on main and the first Production smoke run from the merge deployment

## Blockers

- Vercel Deployment Checks for gate: dashboard-only, owner (B1)
- main ruleset (require PR + gate, block force push/deletion): no tool in this environment can create it, owner (E1, E2)
- Release version number not chosen (owner)

## Decisions

- [human] No MongoDB: contact messages are emailed through Resend (Joshua Small, PR #14)
- [human] No admin page; content lives in code (Joshua Small, 2026-10-26)
- [agent] Canonical public address is https://studio.onesmall.company/ (the vercel.app address is behind Vercel Authentication)
- [human] Studio release approved by Joshua Small (owner-reported; recorded by the agent, not approved by it) (Joshua Small, project thread "Close Studio release", 2026-11-02 18:08 UTC)
- [agent] One required check, CI / gate, decides merge and (once Deployment Checks is on) production
- [agent] Browser CI runs inside the official Playwright image pinned by digest instead of installing browsers and apt packages per job

## Constraints

- Free tiers only; no paid services or billing changes
- No redesign, new music or commercial features in the Studio release
- Any new third-party host must be added to the CSP in vercel.json
- Production redeploys and release approval belong to Joshua Small
- Roadmap: ROADMAP.md
- CI/CD exceptions and review dates: docs/ci/exceptions.md (review by 2027-05-05)

## Unresolved decisions

- Whether one-small-studio.vercel.app should be public (ROADMAP item 3)
- Release version number (owner decision)
