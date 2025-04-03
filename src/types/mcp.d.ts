export interface IMCPServer {
  key: string;
  name?: string;
  command?: string;
  description?: string;
  args?: string[];
  env?: Record<string, string>;
  isActive?: boolean;
  homepage?: string;
  
  // 新增 SSE 相关配置
  transportType?: 'stdio' | 'sse'; // 传输类型
  url?: string; // SSE 服务器 URL
  authProvider?: any; // 认证提供者配置
}

export type MCPArgType = 'string' | 'list' | 'number';
export type MCPEnvType = 'string' | 'number';
export type MCPArgParameter = { [key: string]: MCPArgType };
export type MCPEnvParameter = { [key: string]: MCPEnvType };

export interface IMCPServerParameter {
  name: string;
  type: MCPArgType | MCPEnvType;
  description: string;
}

export interface IMCPConfig {
  servers: IMCPServer[];
  updated?: number;
}
