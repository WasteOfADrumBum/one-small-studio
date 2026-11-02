# Studio release: acceptance record

Joshua Small's review of the Studio release. The agent has not approved anything and cannot.
"Owner-reported" items are recorded from Josh's own words in the project thread.

Evidence: [studio-release-evidence.md](studio-release-evidence.md). Setup and rollback:
[../DEPLOYMENT.md](../DEPLOYMENT.md).

## Release gates

| #   | Gate                                                 | Evidence                                        | Status                   |
| --- | ---------------------------------------------------- | ----------------------------------------------- | ------------------------ |
| 1   | CI green on the release PR                           | CI runs #68 (PR #19), #69 (`main` at `0c958b5`) | Met (automated)          |
| 2   | No high or critical `npm audit` advisories           | `npm audit`: 0                                  | Met (automated)          |
| 3   | Zero axe WCAG 2.2 A/AA violations, desktop and phone | `e2e/accessibility.spec.ts`                     | Met (automated)          |
| 4   | Music plays in production                            | Josh, project thread, 2026-11-02                | Owner-reported           |
| 5   | Contact emails arrive                                | Josh, project thread, 2026-11-02                | Owner-reported           |
| 6   | Production headers present after deploy              | Check A below                                   | Not reported             |
| 7   | Player falls back cleanly when SoundCloud is down    | `e2e/resilience.spec.ts`                        | Met (automated, stubbed) |
| 8   | Screen reader spot check                             | Check B below                                   | Not reported             |
| 9   | Accepted risks acknowledged                          | Josh, project thread, 2026-11-02                | Owner-reported: accepted |
| 10  | Release approval                                     | Josh, project thread, 2026-11-02                | Owner-reported: approved |

## Checks for Josh

**A. Headers (2 minutes, after the PR is merged and deployed).**

```sh
curl -sI https://studio.onesmall.company/ | grep -iE 'content-security|strict-transport|x-frame|x-content-type'
curl -s https://studio.onesmall.company/ | grep -o '/assets/index-[^"]*\.js' | head -1 \
  | xargs -I{} curl -sI https://studio.onesmall.company{} | grep -i cache-control
```

Pass: the first prints four header lines; the second prints
`cache-control: public, max-age=31536000, immutable`.

**B. Screen reader (10 minutes).** With VoiceOver (Cmd+F5 on a Mac) or NVDA on Windows, open
https://studio.onesmall.company/, Tab to "Skip to the story", walk the timeline with the arrow
keys, press Play in the top bar, and send yourself a talkback message. Pass: every control is
announced by a sensible name and the "Message received" confirmation is read out.

**C. Public address (1 minute).** Open https://one-small-studio.vercel.app/ in a private window.
If it shows a Vercel login, that is expected with the current protection setting and visitors
should use `studio.onesmall.company`; nothing else to do.

## Accepted risks (acknowledge or reject)

- [x] The private SoundCloud sets' secret tokens are readable in the public repo and in every
      visitor's browser. Unavoidable while the site plays them.
- [x] The talkback rate limit lives in function memory and resets on cold starts; Resend's free
      cap of 100 a day is the backstop.
- [x] One 824 KB JavaScript file (about 260 KB compressed). Fine for a showcase; splitting it is on
      the roadmap.
- [x] No uptime alerting beyond Vercel's deployment emails and the logs (free tier only).

## Sign-off

- [x] Accepted for release. Recorded from Joshua Small's own message in the project thread
      "Close Studio release", 2026-11-02 18:08 UTC: _"I accept these risks and approve the Studio
      release."_ The agent recorded these words and did not approve anything itself. The risk boxes
      above are ticked on the strength of the same message.

Released as production deployment `dpl_4EpPA6p9NuYWViELPgydN18L1EVr` (READY), built from `main` at
`0c958b5` (merge of PR #19). Vercel reported no runtime errors in the hour after it went live
(agent-observed, 2026-11-02).

Checks A (live headers) and B (screen reader) had not been reported when Josh approved. They
remain worth doing, and any problem they find is follow-up work, not a reopened release.
