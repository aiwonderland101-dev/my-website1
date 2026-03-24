import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('README accuracy', () => {
  it('documents the test-page route and build troubleshooting note', () => {
    const readme = readFileSync('README.md', 'utf8');

    expect(readme).toContain('apps/web/app/test-page/page.tsx');
    expect(readme).toContain('/test-page');
    expect(readme).toContain('Unexpected non-whitespace character after JSON at position 8');
  });
});
