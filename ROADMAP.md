# One Small Studio roadmap

Optional future work. **Nothing here blocks or reopens the current release**, which is defined in
[docs/release-scope-1.0.0.md](docs/release-scope-1.0.0.md). Gates and status live in the
[One Small Engineering hub](https://github.com/WasteOfADrumBum/one-small-engineering/blob/main/projects/registry.json).
After acceptance the site is in maintenance: defects and security fixes only, until the owner
starts a new scoped release from this list.

Priority: **P1** next, **P2** useful, **P3** nice to have.

## E1. More music and catalog entries (P2)

- **Purpose:** grow the catalog as new recordings exist.
- **Scope:** entries in `src/content/releases.ts` and SoundCloud links in `src/lib/site.ts`; no
  layout change.
- **Acceptance criteria:** each entry plays through the widget; content tests pass; CI green.
- **Dependencies:** the recordings being published on SoundCloud.

## E2. More gear in the racks (P3)

- **Purpose:** keep the equipment showcase current.
- **Scope:** one component per new unit using the shared `hardware/` parts, plus its `gear.ts`
  entry.
- **Acceptance criteria:** axe suite still 0 violations; layout holds at 320 px and 200% zoom.
- **Dependencies:** none.

## E3. Contact form abuse protection (P3)

- **Purpose:** reduce spam if it appears.
- **Scope:** honeypot or free-tier rate limit on the contact route; no paid service.
- **Acceptance criteria:** honest messages still arrive; scripted bursts are refused; API tests
  cover both.
- **Dependencies:** evidence of spam.

## E4. Dev-only dependency advisories (P3)

- **Purpose:** clear the 11 moderate dev-tooling advisories (production audit is clean as of
  2026-11-02).
- **Scope:** upgrade when upstream ships fixed ranges; never `npm audit fix --force`.
- **Acceptance criteria:** `npm audit` 0 moderate or higher; CI green.
- **Dependencies:** upstream releases.

## E5. Pin GitHub Actions by SHA (P3)

- **Purpose:** supply-chain hardening; CI uses `actions/checkout@v4` and `actions/setup-node@v4`
  tags today (its token is already limited to `contents: read`).
- **Scope:** pin both to full SHAs.
- **Acceptance criteria:** CI green; no permission widened.
- **Dependencies:** none.
