import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('repository hygiene', () => {
  it('keeps critical workspace files non-empty and valid', () => {
    const root = process.cwd();
    const packageJsonPath = path.resolve(root, 'packages/shadon/package.json');
    const indexPath = path.resolve(root, 'packages/shadon/index.ts');
    const hookPath = path.resolve(root, 'hooks/useAIEventStream.ts');

    const packageRaw = fs.readFileSync(packageJsonPath, 'utf8');
    expect(packageRaw.trim().length).toBeGreaterThan(0);

    const parsed = JSON.parse(packageRaw) as { name?: string; version?: string; main?: string };
    expect(parsed.name).toBe('@wonder/shadon');
    expect(parsed.version).toBeTruthy();
    expect(parsed.main).toBe('index.ts');

    expect(fs.readFileSync(indexPath, 'utf8').trim().length).toBeGreaterThan(0);
    expect(fs.readFileSync(hookPath, 'utf8').trim().length).toBeGreaterThan(0);
  });
});
