import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('ai-wonder-web dev script port behavior', () => {
  it('uses an env-driven default port while keeping fixed 9002 script', () => {
    const pkg = JSON.parse(readFileSync('apps/web/package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(pkg.scripts.dev).toContain('PORT=${PORT:-9002}');
    expect(pkg.scripts.dev).toContain('next dev -p "$PORT" -H 0.0.0.0');
    expect(pkg.scripts['dev:9002']).toContain('next dev -p 9002 -H 0.0.0.0');
  });
});
