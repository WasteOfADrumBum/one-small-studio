<!-- generated from .engineering/state.json (revision 1) -->

# Handoff: one-small-studio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 1, `closeout-2026-11-02-studio`, 2026-11-02T17:04:39Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

Read docs/release-scope-1.0.0.md and ROADMAP.md, then the hub acceptance record docs/acceptance/closeout-2026-11-02.md. Do not add roadmap items to 1.0.0.

## Unfinished

- Owner scope approval and gate verifications (hub acceptance record).

## Blockers

- scope-document-missing stays open in the hub until the owner approves the scope.

## Decisions

- [agent] Proposed 1.0.0 as the first release name for the site already live at studio.onesmall.company; no new features in scope. Owner approval pending.

## Constraints

- Release approval, tags and gate verification belong to Joshua Small.
- Enhancements live in ROADMAP.md and never block or reopen an accepted release.
- Secrets (RESEND_API_KEY, CONTACT_TO) stay in Vercel environment variables.

## Unresolved decisions

- Owner approval of the 1.0.0 scope draft.
- 11 moderate dev-only advisories; production audit clean.
