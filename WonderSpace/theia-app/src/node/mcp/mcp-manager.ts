import { injectable } from '@theia/core/shared/inversify';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  McpServerConfig,
  McpServerStatus,
  McpService,
} from '../../common/mcp-protocol';

interface RuntimeState {
  config: McpServerConfig;
  status: McpServerStatus;
  process?: ChildProcessWithoutNullStreams;
  logs: string[];
}

@injectable()
export class McpManager implements McpService {
  protected readonly servers = new Map<string, RuntimeState>();

  constructor() {
    for (const config of this.readConfig()) {
      this.servers.set(config.id, {
        config,
        status: { id: config.id, label: config.label, status: 'stopped' },
        logs: [],
      });
    }
  }

  async listServers(): Promise<McpServerStatus[]> {
    return Array.from(this.servers.values()).map(({ status }) => ({ ...status }));
  }

  async startServer(id: string): Promise<McpServerStatus> {
    const runtime = this.getRuntime(id);
    if (runtime.process) {
      return { ...runtime.status };
    }

    runtime.status = { ...runtime.status, status: 'starting', lastError: undefined };
    try {
      const child = spawn(runtime.config.command, runtime.config.args ?? [], {
        cwd: runtime.config.cwd ?? process.cwd(),
        env: process.env,
      });

      runtime.process = child;
      runtime.status = {
        ...runtime.status,
        status: 'running',
        pid: child.pid,
      };

      child.stdout.on('data', data => this.appendLog(runtime, data.toString()));
      child.stderr.on('data', data => this.appendLog(runtime, data.toString()));
      child.once('exit', code => {
        runtime.process = undefined;
        runtime.status = {
          ...runtime.status,
          pid: undefined,
          status: code === 0 ? 'stopped' : 'error',
          lastError: code === 0 ? undefined : `Exited with code ${code ?? 'unknown'}`,
        };
      });
      child.once('error', error => {
        runtime.status = {
          ...runtime.status,
          status: 'error',
          lastError: error.message,
        };
        this.appendLog(runtime, error.message);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      runtime.status = { ...runtime.status, status: 'error', lastError: message };
      this.appendLog(runtime, message);
    }

    return { ...runtime.status };
  }

  async stopServer(id: string): Promise<McpServerStatus> {
    const runtime = this.getRuntime(id);
    if (runtime.process) {
      runtime.process.kill();
      runtime.process = undefined;
    }

    runtime.status = {
      ...runtime.status,
      status: 'stopped',
      pid: undefined,
    };

    return { ...runtime.status };
  }

  async getStatus(id: string): Promise<McpServerStatus | undefined> {
    return this.servers.get(id)?.status;
  }

  async tailLogs(id: string, lines = 100): Promise<string[]> {
    const runtime = this.getRuntime(id);
    return runtime.logs.slice(-lines);
  }

  protected getRuntime(id: string): RuntimeState {
    const runtime = this.servers.get(id);
    if (!runtime) {
      throw new Error(`MCP server ${id} is not configured.`);
    }
    return runtime;
  }

  protected appendLog(runtime: RuntimeState, message: string): void {
    runtime.logs.push(...message.split('\n').filter(Boolean));
    if (runtime.logs.length > 1_000) {
      runtime.logs.splice(0, runtime.logs.length - 1_000);
    }
  }

  protected readConfig(): McpServerConfig[] {
    const configPath = resolve(process.cwd(), 'mcp.json');
    if (!existsSync(configPath)) {
      return [];
    }

    const file = JSON.parse(readFileSync(configPath, 'utf8')) as { servers?: McpServerConfig[] };
    return file.servers ?? [];
  }
}
