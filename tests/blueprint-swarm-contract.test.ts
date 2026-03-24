import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

describe('blueprint swarm contract', () => {
  test('master schema and worker task files exist', () => {
    expect(existsSync('docs/blueprints/master-schema.json')).toBe(true);
    expect(existsSync('docs/blueprints/worker-tasks.json')).toBe(true);
    expect(existsSync('docs/blueprints/swarm-plan.md')).toBe(true);
    expect(existsSync('scripts/swarm/run-phase-workers.mjs')).toBe(true);
  });

  test('worker plan references locked state-shape protocol', () => {
    const schema = readJson('docs/blueprints/master-schema.json');
    const tasks = readJson('docs/blueprints/worker-tasks.json');

    expect(schema.version).toBe('1.0.0');
    expect(schema.state).toBeTruthy();
    expect(Object.keys(schema.state)).toEqual(['app', 'projects', 'builder']);

    expect(tasks.protocol.stateShapeLocked).toBe(true);
    expect(tasks.protocol.overlapForbidden).toBe(true);
    expect(tasks.workers).toHaveLength(4);
    expect(tasks.workers.map((worker: any) => worker.id)).toEqual(['A', 'B', 'C', 'D']);
  });

  test('plan includes the header contract and trust layer requirements', () => {
    const plan = readFileSync('docs/blueprints/swarm-plan.md', 'utf8');

    expect(plan).toContain('[Breadcrumb/Back] -> [Title] -> [Subtitle] -> [Primary Action]');
    expect(plan).toContain('loading skeletons');
    expect(plan).toContain('empty state CTA');
    expect(plan).toContain('error toast');
  });
});
