import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

describe('workspace drift', () => {
  test('does not declare unreal-wonder-build as a root workspace path', () => {
    const rootPackage = readFileSync('package.json', 'utf8');
    const pnpmWorkspace = readFileSync('pnpm-workspace.yaml', 'utf8');

    expect(rootPackage).not.toContain('"unreal-wonder-build"');
    expect(pnpmWorkspace).not.toContain("- 'unreal-wonder-build'");
  });

  test('keeps unreal-wonder-build package under packages directory', () => {
    const pkg = readFileSync('packages/unreal-wonder-build/package.json', 'utf8');
    expect(pkg).toContain('"name": "unreal-wonder-build"');
  });
});
