export interface IMCPServer {
  key: string;
  name?: string;
  command: string;
  description?: string;
  args: string[];
  env?: Record<string, string>;
  isActive: boolean;
  homepage?: string;
}

export interface IMCPServerParameter {
  name: string;
  type: string;
  description: string;
}

export interface IMCPConfig {
  servers: IMCPServer[];
  updated?: number;
}
