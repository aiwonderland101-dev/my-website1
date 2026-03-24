import { injectable } from '@theia/core/shared/inversify';
import { AbstractViewContribution, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { CommandRegistry } from '@theia/core/lib/common/command';
import { AiWidget } from './ai-view';

export const OPEN_AI_VIEW_COMMAND = {
  id: 'wonderspace.ai.open',
  label: 'Open AI View',
};

@injectable()
export class AiViewContribution
  extends AbstractViewContribution<AiWidget>
  implements FrontendApplicationContribution {
  constructor() {
    super({
      widgetId: AiWidget.ID,
      widgetName: AiWidget.LABEL,
      defaultWidgetOptions: {
        area: 'right',
        rank: 500,
      },
      toggleCommandId: OPEN_AI_VIEW_COMMAND.id,
    });
  }

  registerCommands(commands: CommandRegistry): void {
    super.registerCommands(commands);
    commands.registerCommand(OPEN_AI_VIEW_COMMAND, {
      execute: () => this.openView({ activate: true }),
    });
  }

  async initializeLayout(): Promise<void> {
    await this.openView({ reveal: true });
  }
}
