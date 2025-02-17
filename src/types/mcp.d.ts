export interface IMCPServer {
  key: string;
  command: string;
  description?: string;
  args: string[];
  env?: Record<string, string>;
  isActive: boolean;
}

export interface IMCPConfig {
  servers: IMCPServer[];
  updated?: number;
}
