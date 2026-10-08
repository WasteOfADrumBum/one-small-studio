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
| Database | MongoDB Atlas with Mongoose (contact inbox)               |
| Music    | SoundCloud Widget API, driven by the profile in `site.ts` |
| Hosting  | Vercel Hobby                                              |
| CI       | GitHub Actions: format, lint, type check and build        |

## Develop

Requires Node 22.12 or newer.

```sh
npm install
npm run dev      # site on http://localhost:5173, API on http://localhost:3001
```

| Command          | What it does                  |
| ---------------- | ----------------------------- |
| `npm run dev`    | Start the site and the API    |
| `npm run build`  | Build the site for production |
| `npm run check`  | Type check                    |
| `npm run lint`   | Lint with ESLint              |
| `npm run format` | Format with Prettier          |

## Layout

- `src/` the site. `src/lib/site.ts` holds names, years, links and the SoundCloud profile;
  `src/content/` holds the timeline and the gear rack.
- `server/app.ts` the Express app. `server/dev.ts` runs it locally.
- `api/index.ts` hands the same app to Vercel; `vercel.json` routes `/api/*` to it.

## Deploy

Import this repo into Vercel. Every pull request gets a preview URL, and merges to `main` deploy
to production. Secrets go in Vercel's environment variables; see `.env.example` for the names.
