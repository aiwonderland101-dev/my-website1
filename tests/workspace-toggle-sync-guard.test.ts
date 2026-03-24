import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('workspace toggle + sync guard integration', () => {
  test('ships builder context at @builder/context/BuilderContext path', () => {
    const contextPath = 'apps/web/app/(builder)/wonder-build/context/BuilderContext.tsx';

    expect(existsSync(contextPath)).toBe(true);

    const source = readFileSync(contextPath, 'utf8');
    expect(source).toContain('export function BuilderProvider');
    expect(source).toContain("mode: 'puck' | 'ide'");
  });

  test('ide page follows trust-layer states and header contract', () => {
    const source = readFileSync('apps/web/app/(tools)/ide/page.tsx', 'utf8');

    expect(source).toContain('PageHeader');
    expect(source).toContain('Breadcrumbs');
    expect(source).toContain('title="IDE Code Mode"');
    expect(source).toContain('subtitle="Edit repository files in a dedicated code workspace.');
    expect(source).toContain("status === 'loading'");
    expect(source).toContain("status === 'empty'");
    expect(source).toContain("status === 'error'");
    expect(source).toContain('role="alert"');
  });
});
