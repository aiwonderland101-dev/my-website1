export const McpServicePath = '/services/mcp';
export const McpServiceSymbol = Symbol('McpService');

export interface McpServerConfig {
  id: string;
  label: string;
  command: string;
  args?: string[];
  cwd?: string;
}

export type McpServerRuntimeStatus = 'stopped' | 'starting' | 'running' | 'error';

export interface McpServerStatus {
  id: string;
  label: string;
  status: McpServerRuntimeStatus;
  pid?: number;
  lastError?: string;
}

export interface McpService {
  listServers(): Promise<McpServerStatus[]>;
  startServer(id: string): Promise<McpServerStatus>;
  stopServer(id: string): Promise<McpServerStatus>;
  getStatus(id: string): Promise<McpServerStatus | undefined>;
  tailLogs(id: string, lines?: number): Promise<string[]>;
}
