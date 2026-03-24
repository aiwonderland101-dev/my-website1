import { describe, expect, test } from 'vitest';
import { evaluateSyncGuard } from '../engine/core/ai/syncGuard';

describe('sync guard contract', () => {
  test('blocks source-write actions while in puck mode', () => {
    const result = evaluateSyncGuard('puck', 'ide:write-source-files');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Blocked by Sync Guard');
  });

  test('blocks visual layout writes while in ide mode', () => {
    const result = evaluateSyncGuard('ide', 'puck:update-layout-json');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Blocked by Sync Guard');
  });

  test('allows orchestrator sync and package rebuild actions', () => {
    expect(evaluateSyncGuard('puck', 'orchestrator:sync').allowed).toBe(true);
    expect(evaluateSyncGuard('ide', 'engine:rebuild-package').allowed).toBe(true);
  });
});
