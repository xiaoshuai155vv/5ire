export interface IMCPServer {
  key: string;
  command: 'uvx' | 'npx';
  description?: string;
  args: string[];
  env?: Record<string, string>;
  isActive: boolean;
}

export interface IMCPConfig {
  servers: IMCPServer[];
  updated?: number;
}
