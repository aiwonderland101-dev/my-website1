import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('WonderSpace/theia-app/package.json', 'utf8'));

function read(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

describe('wonderspace theia app standard wiring', () => {
  test('registers frontend and backend extension modules', () => {
    expect(packageJson.theiaExtensions).toEqual([
      { frontend: 'src/browser/wonderspace-frontend-module' },
      { backend: 'src/node/wonderspace-backend-module' },
    ]);
  });

  test('includes base shell dependencies required for custom views', () => {
    expect(packageJson.dependencies['@theia/core']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/workspace']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/navigator']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/editor']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/terminal']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/output']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/task']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/monaco']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/preferences']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/view-container']).toBe('1.68.2');
    expect(packageJson.dependencies['@theia/messages']).toBe('1.68.2');
  });

  test('applies standard ui frontend configuration', () => {
    expect(packageJson.theia?.frontend?.config?.applicationName).toBe('WonderSpace');
    expect(packageJson.theia?.frontend?.config?.defaultTheme).toBe('dark');
    expect(packageJson.theia?.frontend?.config?.preferences?.['workbench.colorTheme']).toBe('Dark (Theia)');
    expect(packageJson.theiaPluginsDir).toBe('plugins');
  });

  test('wires standard layout, views, and mcp backend rpc', () => {
    const frontendModule = read('WonderSpace/theia-app/src/browser/wonderspace-frontend-module.ts');
    const frontendContribution = read('WonderSpace/theia-app/src/browser/wonderspace-standard-layout-contribution.ts');
    const extensionsContribution = read('WonderSpace/theia-app/src/browser/mcp/extensions-contribution.ts');
    const aiContribution = read('WonderSpace/theia-app/src/browser/ai/ai-contribution.ts');
    const mcpProtocol = read('WonderSpace/theia-app/src/common/mcp-protocol.ts');
    const mcpManager = read('WonderSpace/theia-app/src/node/mcp/mcp-manager.ts');
    const backendModule = read('WonderSpace/theia-app/src/node/wonderspace-backend-module.ts');
    const backendContribution = read('WonderSpace/theia-app/src/node/wonderspace-backend-contribution.ts');

    expect(frontendModule).toContain('ExtensionsViewContribution');
    expect(frontendModule).toContain('AiViewContribution');
    expect(frontendContribution).toContain("executeCommand('navigator.focus')");
    expect(frontendContribution).toContain("executeCommand('terminal:new')");
    expect(extensionsContribution).toContain("area: 'left'");
    expect(aiContribution).toContain("area: 'right'");
    expect(mcpProtocol).toContain("McpServicePath = '/services/mcp'");
    expect(mcpManager).toContain('startServer(id: string)');
    expect(backendModule).toContain('RpcConnectionHandler');
    expect(backendContribution).toContain("app.get('/api/health'");
  });
});
