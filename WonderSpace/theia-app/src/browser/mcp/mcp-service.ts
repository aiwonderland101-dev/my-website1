import { inject, injectable } from '@theia/core/shared/inversify';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser/messaging/ws-connection-provider';
import { McpService, McpServicePath } from '../../common/mcp-protocol';

@injectable()
export class McpServiceProxy {
  protected readonly proxy: McpService;

  constructor(
    @inject(WebSocketConnectionProvider)
    connectionProvider: WebSocketConnectionProvider,
  ) {
    this.proxy = connectionProvider.createProxy<McpService>(McpServicePath);
  }

  listServers() {
    return this.proxy.listServers();
  }

  startServer(id: string) {
    return this.proxy.startServer(id);
  }

  stopServer(id: string) {
    return this.proxy.stopServer(id);
  }

  getStatus(id: string) {
    return this.proxy.getStatus(id);
  }

  tailLogs(id: string, lines?: number) {
    return this.proxy.tailLogs(id, lines);
  }
}
