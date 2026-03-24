import { ContainerModule } from '@theia/core/shared/inversify';
import {
  FrontendApplicationContribution,
  WidgetFactory,
  bindViewContribution,
} from '@theia/core/lib/browser';
import { StandardLayoutContribution } from './wonderspace-standard-layout-contribution';
import { ExtensionsWidget } from './mcp/extensions-view';
import { ExtensionsViewContribution } from './mcp/extensions-contribution';
import { McpServiceProxy } from './mcp/mcp-service';
import { AiWidget } from './ai/ai-view';
import { AiViewContribution } from './ai/ai-contribution';

export default new ContainerModule(bind => {
  bind(StandardLayoutContribution).toSelf().inSingletonScope();
  bind(FrontendApplicationContribution).toService(StandardLayoutContribution);

  bind(McpServiceProxy).toSelf().inSingletonScope();

  bindViewContribution(bind, ExtensionsViewContribution);
  bind(FrontendApplicationContribution).toService(ExtensionsViewContribution);
  bind(ExtensionsWidget).toSelf();
  bind(WidgetFactory)
    .toDynamicValue(context => ({
      id: ExtensionsWidget.ID,
      createWidget: () => context.container.get(ExtensionsWidget),
    }))
    .inSingletonScope();

  bindViewContribution(bind, AiViewContribution);
  bind(FrontendApplicationContribution).toService(AiViewContribution);
  bind(AiWidget).toSelf();
  bind(WidgetFactory)
    .toDynamicValue(context => ({
      id: AiWidget.ID,
      createWidget: () => context.container.get(AiWidget),
    }))
    .inSingletonScope();
});
