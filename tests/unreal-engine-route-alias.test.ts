import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('unreal engine routing', () => {
  test('ships a concrete unreal route wired to workspace package', () => {
    expect(existsSync('apps/web/app/(builder)/unreal-wonder-build/page.tsx')).toBe(true);
    expect(existsSync('packages/unreal-wonder-build/src/UnrealWonderBuildPage.tsx')).toBe(true);

    const routePage = readFileSync('apps/web/app/(builder)/unreal-wonder-build/page.tsx', 'utf8');
    const packagePage = readFileSync('packages/unreal-wonder-build/src/UnrealWonderBuildPage.tsx', 'utf8');

    expect(routePage).toContain('unreal-wonder-build');
    expect(packagePage).toContain('PlayCanvasEngine');
  });

  test('keeps alias rewrite from /unreal-wonder-build to /wonder-build-mobile', () => {
    const nextConfig = readFileSync('apps/web/next.config.js', 'utf8');

    expect(nextConfig).toContain('source: "/unreal-wonder-build"');
    expect(nextConfig).toContain('destination: "/wonder-build-mobile"');
  });
});
