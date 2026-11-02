# One Small Studio 1.0.0: release scope (draft for owner approval)

Status: **DRAFT**, proposed 2026-11-02 by Claude Code (builder). It becomes the approved scope only
when Joshua Small approves it; until then the hub keeps blocker `scope-document-missing` open.

Project: `one-small-studio` in the
[One Small Engineering registry](https://github.com/WasteOfADrumBum/one-small-engineering/blob/main/projects/registry.json).
Tier: **Showcase** (10 gates in the hub's
[Definition of Done](https://github.com/WasteOfADrumBum/one-small-engineering/blob/main/standards/definition-of-done.md)).
Non-commercial: no rates, booking or sales.

## Why 1.0.0

There are no tags or releases; `package.json` 0.1.0 is a placeholder. Production at
[studio.onesmall.company](https://studio.onesmall.company) already serves `main`. 1.0.0 names the
live site as the first accepted release. The hub's earlier leads ("equipment showcase, final QA")
are covered: the gear racks ship in S2 and final QA is the gate list below.

## In scope

| #   | Item                                                                                     | Where                                                     |
| --- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| S1  | Hero, story timeline with real years, outro and footer links                             | `src/components/`, `src/content/story.ts`                 |
| S2  | Equipment showcase: console and rack hardware with the shared hardware parts             | `src/components/`, `src/content/gear.ts`                  |
| S3  | Catalog and music playback through the SoundCloud widget (transport bar, track list)     | `Catalog`, `TransportBar`, `TrackList`, `src/lib/site.ts` |
| S4  | Contact form that emails Josh through Resend, with a clear message when the send fails   | `server/`, `api/index.ts`, PRs #14, #15                   |
| S5  | Accessibility fixes from the launch audit and the axe browser tests                      | PR #13, `e2e/accessibility.spec.ts`                       |
| S6  | Share tags, OG image, robots.txt and sitemap                                             | PR #13                                                    |
| S7  | Content Security Policy and security headers; high npm advisories resolved               | PRs #16, #17, `e2e/security.spec.ts`                      |
| S8  | CI: format, lint, type check, unit and API tests, build, browser and accessibility tests | `.github/workflows/ci.yml`                                |
| S9  | Accurate README (stack, develop, deploy, rollback)                                       | `README.md`                                               |

## Acceptance criteria (Showcase gates)

| Gate                      | Criterion for 1.0.0                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `scope-complete`          | Owner approves this document; S1–S9 present on the release commit.                                     |
| `automated-checks`        | CI green on the release commit.                                                                        |
| `security-privacy-review` | Contact API reviewed under the hub's `standards/security.md`; no high or critical production advisory. |
| `wcag-22-aa`              | `npm run test:e2e` accessibility suite passes; owner manual review.                                    |
| `keyboard-screen-reader`  | Owner keyboard-only and screen-reader pass over navigation, playback controls and the contact form.    |
| `responsive-layouts`      | Owner checks phone, tablet, desktop and 200% zoom.                                                     |
| `critical-workflows`      | Navigation, music playback and the contact form (email arrives) work in production.                    |
| `production-deployment`   | studio.onesmall.company serves the release commit (Vercel deployment id recorded).                     |
| `documentation-accurate`  | README matches the project as built.                                                                   |
| `no-release-blockers`     | No open blocker in the registry.                                                                       |

## Out of scope (see [ROADMAP.md](../ROADMAP.md))

More music, catalog entries or gear; any redesign. Content updates never block or reopen this
release.

## Release identity

Tag `v1.0.0` on the accepted commit and set `package.json` to 1.0.0 only after owner approval. The
tag and any GitHub release are owner actions.
