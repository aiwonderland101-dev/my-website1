import { inject, injectable } from '@theia/core/shared/inversify';
import {
  ApplicationShell,
  FrontendApplication,
  FrontendApplicationContribution,
} from '@theia/core/lib/browser';
import { CommandService } from '@theia/core/lib/common/command';

@injectable()
export class StandardLayoutContribution implements FrontendApplicationContribution {
  @inject(CommandService)
  protected readonly commands: CommandService;

  @inject(ApplicationShell)
  protected readonly shell: ApplicationShell;

  async initializeLayout(_app: FrontendApplication): Promise<void> {
    await this.commands.executeCommand('navigator.focus');

    if (this.shell.bottomPanel.widgets.length === 0) {
      await this.commands.executeCommand('terminal:new');
    }
  }
}
