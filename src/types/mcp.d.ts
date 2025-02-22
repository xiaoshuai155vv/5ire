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

export type IMCPArgType = 'string'|'list'
export type IMCPEnvType = 'string'|'number'
export type IMCPArgParameter = {[key:string]:IMCPArgType}
export type IMCPEnvParameter = {[key:string]:IMCPEnvType}

export interface IMCPServerParameter {
  name: string;
  type: IMCPArgType|IMCPEnvType;
  description: string;
}



export interface IMCPConfig {
  servers: IMCPServer[];
  updated?: number;
}
