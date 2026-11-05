import { describe, expect, it } from 'vitest';
import { decide, EXPECTED } from './gate.mjs';

const all = (result: string) => Object.fromEntries(EXPECTED.map((j) => [j, { result }]));

describe('CI gate', () => {
  it('passes when every job succeeded', () => {
    expect(decide(all('success'), false).ok).toBe(true);
  });

  it.each(['failure', 'cancelled', 'skipped'])('fails when a job is %s', (result) => {
    expect(decide({ ...all('success'), unit: { result } }, false).ok).toBe(false);
  });

  it('fails when a job is missing or unexpected', () => {
    const missing = all('success');
    delete missing.browser;
    expect(decide(missing, false).ok).toBe(false);
    expect(decide({ ...all('success'), extra: { result: 'success' } }, false).ok).toBe(false);
  });

  it('accepts a skipped CodeQL only on a fork pull request', () => {
    const skipped = { ...all('success'), codeql: { result: 'skipped' } };
    expect(decide(skipped, true).ok).toBe(true);
    expect(decide(skipped, false).ok).toBe(false);
    expect(decide({ ...all('success'), static: { result: 'skipped' } }, true).ok).toBe(false);
  });
});
