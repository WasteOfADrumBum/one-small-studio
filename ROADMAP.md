# Roadmap

Future work for One Small Studio, after the Studio release. Nothing here blocks that release;
release blockers and sign-off live in
[docs/release/studio-release-acceptance.md](docs/release/studio-release-acceptance.md).

Ground rules carried forward: hobby showcase, no sales or booking, free tiers only, no admin page
(content lives in code), and Josh's real gear and history drawn as accurately as his photos.

Priority: **P1** worth doing next, **P2** nice to have, **P3** only if a need shows up.

## Release blockers

None open in code. The remaining items are Josh's checks and sign-off in the acceptance record.

## Enhancements

### 1. Split the JavaScript bundle (P2)

- **Purpose:** faster first paint on phones and slow connections.
- **Scope:** lazy-load the heavy below-the-fold sections (racks, PC tower, catalog) with
  `React.lazy`; no visual change.
- **Acceptance:** the initial JS chunk is under 400 KB uncompressed; all e2e and axe tests pass;
  Lighthouse performance on mobile does not drop.
- **Dependencies:** none.

### 2. Durable talkback rate limit (P3)

- **Purpose:** keep the three-an-hour limit across cold starts if spam ever gets through.
- **Scope:** only if Resend shows abuse. Either Vercel Firewall rate limiting on `/api/contact`
  (free tier rules) or a free key-value store. No paid service.
- **Acceptance:** a fourth message in an hour from the same sender is refused even after a
  redeploy; existing API tests still pass.
- **Dependencies:** evidence of abuse in Resend or Vercel logs; a free-tier option still being
  available.

### 3. Send the vercel.app address to the custom domain (P2)

- **Purpose:** one public address for visitors and search engines.
- **Scope:** decide whether `one-small-studio.vercel.app` should be public. If yes, set Vercel
  Deployment Protection to Standard and add a host redirect in `vercel.json` to
  `https://studio.onesmall.company`.
- **Acceptance:** the vercel.app address answers 308 to the custom domain for an anonymous visitor;
  previews stay protected.
- **Dependencies:** Josh's choice on Deployment Protection (Vercel dashboard).

### 4. Error alerting (P3)

- **Purpose:** hear about a broken talkback form without checking logs.
- **Scope:** a free option only, such as a Vercel log drain or Resend webhook to email Josh on a
  failed send.
- **Acceptance:** a forced Resend failure on a preview produces a notification within 15 minutes.
- **Dependencies:** a free tier that supports it; Josh's preference.

### 5. Apple touch icon and web manifest (P3)

- **Purpose:** the site looks right when saved to a phone's home screen.
- **Scope:** 180 px PNG icon, `manifest.webmanifest`, matching `theme-color`.
- **Acceptance:** iOS and Android home-screen shortcuts show the icon; CSP tests pass.
- **Dependencies:** none.

### 6. New albums when SoundCloud has room (P3)

- **Purpose:** keep the catalog current.
- **Scope:** add a release to `src/content/releases.ts` using the API URL with its secret token
  from SoundCloud's embed code, plus cover art.
- **Acceptance:** the album plays on the live site (Josh checks), content tests pass.
- **Dependencies:** Josh's SoundCloud storage; new music. Out of scope for the Studio release.

### 7. Dependency upkeep (P2, recurring)

- **Purpose:** stay clear of advisories.
- **Scope:** monthly `npm outdated` and `npm audit`; minor and patch updates in one PR. Remove the
  `minimatch` override once ESLint depends on 11.0.1 or newer. Major upgrades (TypeScript 7,
  Playwright beyond the sandbox's 1.63) get their own PRs.
- **Acceptance:** CI green; `npm audit` reports no high or critical advisories.
- **Dependencies:** none.
