import * as React from '@theia/core/shared/react';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { BinaryBuffer } from '@theia/core/lib/common/buffer';

interface ChatEntry {
  role: 'user' | 'assistant';
  text: string;
}

@injectable()
export class AiWidget extends ReactWidget {
  static readonly ID = 'wonderspace-ai-widget';
  static readonly LABEL = 'AI';

  @inject(MessageService)
  protected readonly messageService: MessageService;

  @inject(FileService)
  protected readonly fileService: FileService;

  @inject(WorkspaceService)
  protected readonly workspaceService: WorkspaceService;

  protected chat: ChatEntry[] = [];
  protected loading = false;
  protected draft = '';

  @postConstruct()
  protected init(): void {
    this.id = AiWidget.ID;
    this.title.label = AiWidget.LABEL;
    this.title.caption = 'WonderSpace AI Assistant';
    this.title.iconClass = 'codicon codicon-sparkle';
    this.title.closable = true;
    this.update();
  }

  protected async send(): Promise<void> {
    if (!this.draft.trim()) {
      return;
    }
    const prompt = this.draft.trim();
    this.chat = [...this.chat, { role: 'user', text: prompt }];
    this.loading = true;
    this.update();

    const reply = 'Draft received. You can click "Apply patch" if this is JSON with {"path","content"}.';
    this.chat = [...this.chat, { role: 'assistant', text: reply }];
    this.draft = '';
    this.loading = false;
    this.update();
  }

  protected async applyPatch(): Promise<void> {
    try {
      const payload = JSON.parse(this.draft || '{}') as { path?: string; content?: string };
      if (!payload.path || typeof payload.content !== 'string') {
        this.messageService.error('Patch format must be JSON: {"path":"file.txt","content":"..."}');
        return;
      }
      const roots = await this.workspaceService.roots;
      const root = roots[0];
      if (!root) {
        this.messageService.error('No workspace root available.');
        return;
      }
      const target = root.resource.resolve(payload.path);
      await this.fileService.write(target, BinaryBuffer.fromString(payload.content));
      this.messageService.info(`Applied patch to ${payload.path}`);
      this.chat = [...this.chat, { role: 'assistant', text: `Applied patch to ${payload.path}` }];
      this.update();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.messageService.error(`Failed to apply patch: ${message}`);
    }
  }

  protected render(): React.ReactNode {
    return (
      <div style={{ padding: '0.75rem', display: 'grid', gap: '0.5rem' }}>
        {this.loading && <div className="theia-widget-noInfo">Loading response…</div>}
        {!this.loading && this.chat.length === 0 && (
          <div className="theia-widget-noInfo">Ask AI for a change, then apply as patch JSON.</div>
        )}
        <div style={{ maxHeight: '40vh', overflow: 'auto', border: '1px solid var(--theia-widget-border)', padding: '0.5rem' }}>
          {this.chat.map((entry, index) => (
            <div key={index}>
              <strong>{entry.role === 'user' ? 'You' : 'AI'}:</strong> {entry.text}
            </div>
          ))}
        </div>
        <textarea
          value={this.draft}
          onChange={event => {
            this.draft = event.target.value;
            this.update();
          }}
          rows={8}
          placeholder='Type prompt or JSON patch: {"path":"README.md","content":"..."}'
        />
        <div>
          <button className="theia-button" onClick={() => void this.send()}>
            Send
          </button>
          <button className="theia-button secondary" onClick={() => void this.applyPatch()} style={{ marginLeft: '0.5rem' }}>
            Apply patch
          </button>
        </div>
      </div>
    );
  }
}
