import { describe, expect, test } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('tsconfig alias contract', () => {
  test('apps/web tsconfig extends root tsconfig.base.json', () => {
    expect(existsSync('tsconfig.base.json')).toBe(true);

    const webTsConfig = readFileSync('apps/web/tsconfig.json', 'utf8');
    expect(webTsConfig).toContain('"extends": "../../tsconfig.base.json"');
  });

  test('apps/web declares @builder alias to wonder-build route tree', () => {
    const webTsConfig = readFileSync('apps/web/tsconfig.json', 'utf8');

    expect(webTsConfig).toContain('"@builder/*"');
    expect(webTsConfig).toContain('./app/(builder)/wonder-build/*');
  });
});
