import { describe, expect, it } from 'vitest';
import { headersFor, readVercelConfig, rewriteFor, sourcePattern } from './vercel-config.js';

const config = readVercelConfig();

describe('vercel.json as the test server reads it', () => {
  it('keeps every route on the site, and every /api path on the function', () => {
    expect(rewriteFor(config, '/api/contact')).toBe('/api');
    expect(rewriteFor(config, '/')).toBe('/index.html');
    expect(rewriteFor(config, '/no-such-page')).toBe('/index.html');
  });

  it('sends the security headers on every path', () => {
    for (const path of ['/', '/no-such-page', '/assets/index-abc.js', '/api/health']) {
      const h = headersFor(config, path);
      expect(h['content-security-policy']).toContain("default-src 'self'");
      expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['x-frame-options']).toBe('DENY');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    }
  });

  it('caches hashed assets for a year and never caches the API or the version file', () => {
    expect(headersFor(config, '/assets/index-abc.js')['cache-control']).toBe(
      'public, max-age=31536000, immutable',
    );
    expect(headersFor(config, '/api/contact')['cache-control']).toBe('no-store');
    expect(headersFor(config, '/version.json')['cache-control']).toBe('no-store');
    expect(headersFor(config, '/')['cache-control']).toBeUndefined();
  });

  it('allows no unsafe script sources and only the SoundCloud hosts the player needs', () => {
    const csp = headersFor(config, '/')['content-security-policy'];
    const directive = (name: string) =>
      csp
        .split(';')
        .map((d) => d.trim())
        .find((d) => d.startsWith(`${name} `)) ?? '';
    expect(directive('script-src')).toBe("script-src 'self' https://w.soundcloud.com");
    expect(csp).not.toMatch(/unsafe-eval|'unsafe-inline'[^;]*script|\*\s|data:[^;]*script/);
    expect(directive('frame-src')).toBe('frame-src https://w.soundcloud.com');
    expect(directive('connect-src')).toBe("connect-src 'self' https://soundcloud.com");
    expect(directive('object-src')).toBe("object-src 'none'");
  });

  it('refuses vercel.json patterns it cannot emulate instead of ignoring them', () => {
    expect(() => sourcePattern('/blog/:slug')).toThrow(/Unsupported/);
    expect(() => sourcePattern('/(\\d+)')).toThrow(/Unsupported/);
    expect(sourcePattern('/assets/(.*)').test('/assets/a/b.js')).toBe(true);
    expect(sourcePattern('/((?!api/).*)').test('/api/x')).toBe(false);
  });
});
