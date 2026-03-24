import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('apps/web/components.json registry config', () => {
  it('uses an object-based registries map with the shadcn alias', () => {
    const filePath = path.resolve(process.cwd(), 'apps/web/components.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
      registries?: unknown;
    };

    expect(data.registries).toBeTypeOf('object');
    expect(Array.isArray(data.registries)).toBe(false);
    expect(data.registries).toMatchObject({
      '@shadcn': 'https://ui.shadcn.com/r/{name}.json',
    });
  });
});
