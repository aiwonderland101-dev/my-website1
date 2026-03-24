import { ContainerModule } from '@theia/core/shared/inversify';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { ConnectionHandler, RpcConnectionHandler } from '@theia/core/lib/common/messaging';
import { WonderSpaceBackendContribution } from './wonderspace-backend-contribution';
import { McpManager } from './mcp/mcp-manager';
import { McpService, McpServicePath } from '../common/mcp-protocol';

export default new ContainerModule(bind => {
  bind(WonderSpaceBackendContribution).toSelf().inSingletonScope();
  bind(BackendApplicationContribution).toService(WonderSpaceBackendContribution);

  bind(McpManager).toSelf().inSingletonScope();
  bind(ConnectionHandler)
    .toDynamicValue(context =>
      new RpcConnectionHandler<McpService>(McpServicePath, () => context.container.get(McpManager)),
    )
    .inSingletonScope();
});
