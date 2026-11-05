import { readFileSync } from 'node:fs';

/**
 * Reads the routing and header rules from vercel.json, so the local production server
 * (server/preview.ts) and the tests apply exactly what Vercel applies, from the same file.
 *
 * Only the pattern syntax this project uses is supported: literal paths with `(.*)` and
 * negative lookahead groups such as `((?!api/).*)`. Anything else throws, so a new rule in
 * vercel.json cannot be silently ignored by the test server.
 */
type HeaderRule = { source: string; headers: { key: string; value: string }[] };
type Rewrite = { source: string; destination: string };
export type VercelConfig = { rewrites: Rewrite[]; headers: HeaderRule[] };

export function readVercelConfig(file = new URL('../vercel.json', import.meta.url)): VercelConfig {
  const config = JSON.parse(readFileSync(file, 'utf8')) as Partial<VercelConfig>;
  return { rewrites: config.rewrites ?? [], headers: config.headers ?? [] };
}

/** Turns a vercel.json `source` into an anchored RegExp. */
export function sourcePattern(source: string): RegExp {
  if (!source.startsWith('/')) throw new Error(`Unsupported vercel.json source: ${source}`);
  // Vercel sources are path-to-regexp; this project only uses regex groups, so escape the rest.
  let out = '';
  for (let i = 0; i < source.length;) {
    if (source[i] === '(') {
      let depth = 0;
      let j = i;
      for (; j < source.length; j++) {
        if (source[j] === '(') depth++;
        if (source[j] === ')' && --depth === 0) break;
      }
      const group = source.slice(i, j + 1);
      if (!/^\((\(\?![\w/-]+\))?\.\*\)$/.test(group)) {
        throw new Error(`Unsupported vercel.json pattern group: ${group}`);
      }
      out += group;
      i = j + 1;
    } else {
      if (/[:*+?]/.test(source[i])) throw new Error(`Unsupported vercel.json source: ${source}`);
      out += source[i].replace(/[.^$|[\]{}\\]/g, '\\$&');
      i++;
    }
  }
  return new RegExp(`^${out}$`);
}

/** The headers Vercel sends for `path`: every matching rule, later rules winning on the same key. */
export function headersFor(config: VercelConfig, path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rule of config.headers) {
    if (!sourcePattern(rule.source).test(path)) continue;
    for (const { key, value } of rule.headers) out[key.toLowerCase()] = value;
  }
  return out;
}

/** Where Vercel sends a path that matches no file: the first matching rewrite, or null (404). */
export function rewriteFor(config: VercelConfig, path: string): string | null {
  for (const rule of config.rewrites) {
    if (sourcePattern(rule.source).test(path)) return rule.destination;
  }
  return null;
}
