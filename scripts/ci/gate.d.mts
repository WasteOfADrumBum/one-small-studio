export declare const EXPECTED: string[];
export declare function decide(
  needs: Record<string, { result?: string }>,
  forkPr: boolean,
): { ok: boolean; lines: string[] };
