import { ConnectionHandler, RpcConnectionHandler } from '@theia/core/lib/common/messaging';
import { ContainerModule } from '@theia/core/shared/inversify';
import { McpService, McpServicePath, McpServiceSymbol } from '../../common/mcp-protocol';
import { McpManager } from './mcp-manager';

export default new ContainerModule(bind => {
  bind(McpManager).toSelf().inSingletonScope();
  bind(McpServiceSymbol).toService(McpManager);
  bind(ConnectionHandler)
    .toDynamicValue(context =>
      new RpcConnectionHandler<McpService>(McpServicePath, () => context.container.get(McpManager)),
    )
    .inSingletonScope();
});
