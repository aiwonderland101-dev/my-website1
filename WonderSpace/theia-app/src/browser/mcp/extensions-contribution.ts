import { injectable } from '@theia/core/shared/inversify';
import { AbstractViewContribution, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { CommandRegistry } from '@theia/core/lib/common/command';
import { ExtensionsWidget } from './extensions-view';

export const OPEN_EXTENSIONS_VIEW_COMMAND = {
  id: 'wonderspace.extensions.open',
  label: 'Open Extensions (MCP) View',
};

@injectable()
export class ExtensionsViewContribution
  extends AbstractViewContribution<ExtensionsWidget>
  implements FrontendApplicationContribution {
  constructor() {
    super({
      widgetId: ExtensionsWidget.ID,
      widgetName: ExtensionsWidget.LABEL,
      defaultWidgetOptions: {
        area: 'left',
        rank: 500,
      },
      toggleCommandId: OPEN_EXTENSIONS_VIEW_COMMAND.id,
      toggleKeybinding: 'ctrlcmd+shift+e',
    });
  }

  registerCommands(commands: CommandRegistry): void {
    super.registerCommands(commands);
    commands.registerCommand(OPEN_EXTENSIONS_VIEW_COMMAND, {
      execute: () => this.openView({ activate: true }),
    });
  }

  async initializeLayout(): Promise<void> {
    await this.openView({ reveal: true });
  }
}
