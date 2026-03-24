import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('wonderplay route contract', () => {
  test('ships a dedicated wonder-build playcanvas page with header contract', () => {
    const filePath = 'apps/web/app/(builder)/wonder-build/playcanvas/page.tsx';
    expect(existsSync(filePath)).toBe(true);

    const page = readFileSync(filePath, 'utf8');
    expect(page).toContain('PageHeader');
    expect(page).toContain('Breadcrumbs');
    expect(page).toContain('title="WonderPlay Bridge"');
    expect(page).toContain('subtitle=');
    expect(page).toContain('action=');
  });

  test('includes trust-layer states for embedded playcanvas bridge', () => {
    const page = readFileSync('apps/web/app/(builder)/wonder-build/playcanvas/page.tsx', 'utf8');
    expect(page).toContain('SkeletonGrid');
    expect(page).toContain('EmptyState');
    expect(page).toContain('pushToast');
  });
});
