import * as React from '@theia/core/shared/react';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { McpServiceProxy } from './mcp-service';
import { McpServerStatus } from '../../common/mcp-protocol';
import { MessageService } from '@theia/core';

@injectable()
export class ExtensionsWidget extends ReactWidget {
  static readonly ID = 'wonderspace-extensions-widget';
  static readonly LABEL = 'Extensions (MCP)';

  @inject(McpServiceProxy)
  protected readonly mcpService: McpServiceProxy;

  @inject(MessageService)
  protected readonly messageService: MessageService;

  protected servers: McpServerStatus[] = [];
  protected loading = true;

  @postConstruct()
  protected init(): void {
    this.id = ExtensionsWidget.ID;
    this.title.label = ExtensionsWidget.LABEL;
    this.title.caption = ExtensionsWidget.LABEL;
    this.title.iconClass = 'codicon codicon-extensions';
    this.title.closable = true;
    void this.refresh();
  }

  protected async refresh(): Promise<void> {
    this.loading = true;
    this.update();
    try {
      this.servers = await this.mcpService.listServers();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.messageService.error(`Failed to load MCP servers: ${message}`);
    } finally {
      this.loading = false;
      this.update();
    }
  }

  protected async toggleServer(server: McpServerStatus): Promise<void> {
    try {
      if (server.status === 'running' || server.status === 'starting') {
        await this.mcpService.stopServer(server.id);
      } else {
        await this.mcpService.startServer(server.id);
      }
      await this.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.messageService.error(`Failed to change server state: ${message}`);
    }
  }

  protected render(): React.ReactNode {
    if (this.loading) {
      return <div className="theia-widget-noInfo">Loading MCP servers…</div>;
    }

    if (!this.servers.length) {
      return (
        <div className="theia-widget-noInfo">
          No MCP servers configured. Add entries to <code>mcp.json</code> and refresh.
          <div>
            <button className="theia-button" onClick={() => void this.refresh()}>
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="theia-widget-container" style={{ padding: '0.75rem' }}>
        <button className="theia-button" onClick={() => void this.refresh()}>
          Refresh
        </button>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {this.servers.map(server => (
            <li key={server.id} style={{ marginTop: '0.75rem', borderBottom: '1px solid var(--theia-widget-border)' }}>
              <div><strong>{server.label}</strong></div>
              <div>Status: {server.status}</div>
              {server.lastError && <div style={{ color: 'var(--theia-errorForeground)' }}>{server.lastError}</div>}
              <button className="theia-button" onClick={() => void this.toggleServer(server)}>
                {server.status === 'running' || server.status === 'starting' ? 'Stop' : 'Start'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
