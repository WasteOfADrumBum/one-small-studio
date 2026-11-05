# One Small Studio

The audio side of Joshua Small: thirty-plus years as a drummer, live since 2004, a 2011 graduate
of the Recording Workshop in Chillicothe, Ohio, and years of front-of-house work at festivals and
venues.

This is a personal, non-commercial showcase: no rates, booking or sales. It runs on free tiers.

## Stack

| Layer    | Tool                                                      |
| -------- | --------------------------------------------------------- |
| Frontend | React 19 + TypeScript on Vite                             |
| UI       | Mantine, with a custom dark console theme                 |
| Motion   | GSAP ScrollTrigger for scroll scrubbing, Motion for UI    |
| API      | Node + Express 5, deployed as one Vercel function         |
| Email    | Resend: the contact form emails each message to Josh      |
| Music    | SoundCloud Widget API, driven by the profile in `site.ts` |
| Hosting  | Vercel Hobby                                              |
| CI       | GitHub Actions: checks, browser tests, security, smoke    |

## Develop

Requires Node 22.12 or newer.

```sh
npm install
npm run dev      # site on http://localhost:5173, API on http://localhost:3001
```

| Command            | What it does                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| `npm run dev`      | Start the site and the API                                                     |
| `npm run build`    | Build the site for production                                                  |
| `npm run check`    | Type check                                                                     |
| `npm run lint`     | Lint with ESLint                                                               |
| `npm test`         | Unit and API tests (Vitest)                                                    |
| `npm run test:e2e` | Build, then browser, API and accessibility tests                               |
| `npm run verify`   | CI's Chromium path, locally (not the security, Firefox, WebKit or CodeQL jobs) |
| `npm run smoke`    | Read-only check of the live site                                               |
| `npm run format`   | Format with Prettier                                                           |

## Layout

- `src/` the site. `src/lib/site.ts` holds names, years, links and the SoundCloud profile;
  `src/content/` holds the timeline, the gear racks and the catalog releases.
- `src/components/hardware/` holds the shared equipment parts (knobs, fader, meters, lamps,
  screws); `src/styles/global.css` holds the material, lighting and spacing tokens.
- `server/app.ts` the Express app. `server/dev.ts` runs it locally.
- `api/index.ts` hands the same app to Vercel; `vercel.json` routes `/api/*` to it.

## Deploy

Merges to `main` deploy to production on Vercel (`https://studio.onesmall.company/`); every pull
request gets a protected preview. Setup, environment variables, security headers, monitoring and
rollback are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). The contact form needs `RESEND_API_KEY`
and `CONTACT_TO` in Vercel's Production environment; see `.env.example`.

## Release and roadmap

- CI/CD, smoke checks and rollback: [docs/ci/README.md](docs/ci/README.md)

- Release evidence: [docs/release/studio-release-evidence.md](docs/release/studio-release-evidence.md)
- Acceptance record for sign-off: [docs/release/studio-release-acceptance.md](docs/release/studio-release-acceptance.md)
- Future work: [ROADMAP.md](ROADMAP.md)
