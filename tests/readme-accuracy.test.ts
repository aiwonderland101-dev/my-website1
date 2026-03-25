import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';

describe('README accuracy', () => {
  it('documents the test-page route and references files that exist', () => {
    const readme = readFileSync('README.md', 'utf8');

    expect(readme).toContain('├── test-page');
    expect(existsSync('apps/web/app/test-page/page.tsx')).toBe(true);
    expect(readme).toContain('## Project Structure');
  });
});
