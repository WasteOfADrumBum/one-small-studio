/**
 * The CI gate's decision, kept here so it can be unit-tested (scripts/ci/gate.test.ts).
 *
 * Passes only if every expected job succeeded. The one skip it accepts is CodeQL on a fork pull
 * request (fork tokens cannot upload results). A failed, cancelled, missing or unexpected job, or
 * any other skip, fails the gate.
 */
export const EXPECTED = ['static', 'unit', 'browser', 'cross-browser', 'security', 'codeql'];

/** @param {Record<string, {result?: string}>} needs @param {boolean} forkPr */
export function decide(needs, forkPr) {
  const lines = [];
  let ok = true;
  for (const job of EXPECTED) {
    const result = needs[job]?.result ?? 'missing';
    const allowed = result === 'success' || (job === 'codeql' && forkPr && result === 'skipped');
    lines.push(`${allowed ? 'ok  ' : 'FAIL'} ${job}: ${result}`);
    ok &&= allowed;
  }
  const extra = Object.keys(needs).filter((j) => !EXPECTED.includes(j));
  if (extra.length) {
    lines.push(`FAIL unexpected jobs: ${extra.join(', ')}`);
    ok = false;
  }
  return { ok, lines };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { ok, lines } = decide(JSON.parse(process.env.NEEDS ?? '{}'), process.env.FORK === 'true');
  console.log(lines.join('\n'));
  process.exit(ok ? 0 : 1);
}
