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

export type MCPArgType = 'string'|'list'|'number'
export type MCPEnvType = 'string'|'number'
export type MCPArgParameter = {[key:string]:MCPArgType}
export type MCPEnvParameter = {[key:string]:MCPEnvType}

export interface IMCPServerParameter {
  name: string;
  type: MCPArgType|MCPEnvType;
  description: string;
}



export interface IMCPConfig {
  servers: IMCPServer[];
  updated?: number;
}
