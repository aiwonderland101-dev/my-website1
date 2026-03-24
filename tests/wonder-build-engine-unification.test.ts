import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

describe('wonder-build engine unification', () => {
  test('wonder-build route redirects to puck engine', () => {
    const source = readFileSync('apps/web/app/(builder)/wonder-build/page.tsx', 'utf8');
    expect(source).toContain("redirect('/wonder-build/puck')");
  });
});
