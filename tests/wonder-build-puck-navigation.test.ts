import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('wonder build + puck navigation', () => {
  test('keeps puck route available and wonder-build redirects to it', () => {
    expect(existsSync('apps/web/app/(builder)/wonder-build/puck/page.tsx')).toBe(true);

    const page = readFileSync('apps/web/app/(builder)/wonder-build/page.tsx', 'utf8');
    expect(page).toContain('redirect(\'/wonder-build/puck\')');
  });

  test('topbar and dashboard nav point to puck route', () => {
    const topbar = readFileSync('apps/web/app/(builder)/wonder-build/components/Topbar.tsx', 'utf8');
    const dashboard = readFileSync('apps/web/app/(workspace)/dashboard/layout.tsx', 'utf8');

    expect(topbar).toContain('router.push(\'/wonder-build/puck\')');
    expect(dashboard).toContain('href: \"/wonder-build/puck\"');
  });
});
