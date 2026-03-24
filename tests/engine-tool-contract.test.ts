import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

describe('engine/tool contract', () => {
  test('documents mandatory separation and trust-layer requirements for agents', () => {
    const contract = readFileSync('docs/guides/engine-tool-contract.md', 'utf8');

    expect(contract).toContain('Do not bundle PlayCanvas inside Puck');
    expect(contract).toContain('WonderSpace/Theia remains standalone');
    expect(contract).toContain('Skeleton (Loading)');
    expect(contract).toContain('Empty State (with CTA)');
    expect(contract).toContain('Error Toast or Alert (Graceful Failure)');
  });

  test('playcanvas engine implementation satisfies trust-layer states', () => {
    const playCanvasEngine = readFileSync('packages/unreal-wonder-build/components/PlayCanvasEngine.tsx', 'utf8');

    expect(playCanvasEngine).toContain("status === 'loading'");
    expect(playCanvasEngine).toContain("status === 'empty'");
    expect(playCanvasEngine).toContain("status === 'error'");
    expect(playCanvasEngine).toContain('role=\"alert\"');
  });

  test('puck route stays sibling to playcanvas package route', () => {
    const puckPage = readFileSync('apps/web/app/(builder)/wonder-build/puck/page.tsx', 'utf8');

    expect(puckPage).not.toContain("from '../components/PlayCanvasEngine'");
    expect(puckPage).not.toContain("from 'playcanvas'");
    expect(puckPage).toContain('Open 3D World Route');
  });
});
