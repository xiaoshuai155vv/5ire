import path from 'path';
import fs from 'node:fs';
import { app } from 'electron';
import { IMCPConfig, IMCPServer } from 'types/mcp';
import { isUndefined, omitBy } from 'lodash';
import EventSource from 'eventsource';

export const DEFAULT_INHERITED_ENV_VARS =
  process.platform === 'win32'
    ? [
        'APPDATA',
        'HOMEDRIVE',
        'HOMEPATH',
        'LOCALAPPDATA',
        'PATH',
        'PROCESSOR_ARCHITECTURE',
        'SYSTEMDRIVE',
        'SYSTEMROOT',
        'TEMP',
        'USERNAME',
        'USERPROFILE',
      ]
    : /* list inspired by the default env inheritance of sudo */
      ['HOME', 'LOGNAME', 'PATH', 'SHELL', 'TERM', 'USER'];
/**
 * Returns a default environment object including only environment variables deemed safe to inherit.
 */
export function getDefaultEnvironment() {
  const env: Record<string, string> = {};
  DEFAULT_INHERITED_ENV_VARS.forEach((key) => {
    const value = process.env[key];
    if (value === undefined) {
      return;
    }
    if (value.startsWith('()')) {
      // Skip functions, which are a security risk.
      return;
    }
    env[key] = value;
  });
  return env;
}

// 修改日志工具函数
function log(message: string, type: 'info' | 'error' = 'info') {
  // 使用英文消息替代中文，避免编码问题
  const timestamp = new Date().toISOString();
  const prefix = type === 'info' ? '[INFO]' : '[ERROR]';
  
  // 控制台输出英文消息
  if (type === 'info') {
    console.log(`${prefix} ${timestamp} - ${message}`);
  } else {
    console.error(`${prefix} ${timestamp} - ${message}`);
  }
  
  // 同时将原始消息写入日志文件
  try {
    const logPath = path.join(app.getPath('userData'), 'mcp.log');
    fs.appendFileSync(logPath, `${prefix} ${timestamp} - ${message}\n`);
  } catch (e) {
    console.error('Failed to write to log file:', e);
  }
}

export default class ModuleContext {
  private clients: { [key: string]: any } = {};

  private Client: any;

  private StdioTransport: any;
  
  private SSETransport: any;

  private cfgPath: string;

  constructor() {
    this.cfgPath = path.join(app.getPath('userData'), 'mcp.json');
  }

  public async init() {
    this.Client = await this.importClient();
    this.StdioTransport = await this.importStdioTransport();
    this.SSETransport = await this.importSSETransport();
  }

  private async importClient() {
    const { Client } = await import(
      '@modelcontextprotocol/sdk/client/index.js'
    );
    return Client;
  }

  private async importStdioTransport() {
    const { StdioClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/stdio.js'
    );
    return StdioClientTransport;
  }

  private async importSSETransport() {
    try {
      log('正在导入 SSE 传输模块...');
      const { SSEClientTransport } = await import(
        '@modelcontextprotocol/sdk/client/sse.js'
      );
      log('SSE 传输模块导入成功');
      return SSEClientTransport;
    } catch (error) {
      log(`导入 SSE 传输模块失败: ${error.message}`);
      throw error;
    }
  }

  private getMCPServer(server: IMCPServer, config: IMCPConfig) {
    let mcpSvr = config.servers.find(
      (svr: IMCPServer) => svr.key === server.key,
    );
    mcpSvr = {
      ...mcpSvr,
      ...omitBy({ ...server, isActive: true }, isUndefined),
    };
    log('MCP Server:', mcpSvr);
    return mcpSvr;
  }

  private async updateConfigAfterActivation(
    server: IMCPServer,
    config: IMCPConfig,
  ) {
    const index = config.servers.findIndex(
      (svr: IMCPServer) => svr.key === server.key,
    );
    if (index > -1) {
      config.servers[index] = server;
    } else {
      config.servers.push(server);
    }
    await this.putConfig(config);
  }

  private async updateConfigAfterDeactivation(key: string, config: IMCPConfig) {
    config.servers = config.servers.map((svr: IMCPServer) => {
      if (svr.key === key) {
        svr.isActive = false;
      }
      return svr;
    });
    await this.putConfig(config);
  }

  public async getConfig() {
    const defaultConfig = { servers: [] };
    try {
      if (!fs.existsSync(this.cfgPath)) {
        fs.writeFileSync(this.cfgPath, JSON.stringify(defaultConfig, null, 2));
      }
      const config = JSON.parse(fs.readFileSync(this.cfgPath, 'utf-8'));
      if (!config.servers) {
        config.servers = [];
      }
      return config;
    } catch (err: any) {
      log(err);
      return defaultConfig;
    }
  }

  public async putConfig(config: any) {
    try {
      fs.writeFileSync(this.cfgPath, JSON.stringify(config, null, 2));
      return true;
    } catch (err: any) {
      log(err);
      return false;
    }
  }

  public async load() {
    const { servers } = await this.getConfig();
    for (const server of servers) {
      if (server.isActive) {
        log(`Activating server: ${server.key}`);
        const { error } = await this.activate(server);
        if (error) {
          log(`Failed to activate server: ${server.key}`, 'error');
        }
      }
    }
  }

  public async addServer(server: IMCPServer) {
    const config = await this.getConfig();
    if (!config.servers.find((svr: IMCPServer) => svr.key === server.key)) {
      config.servers.push(server);
      await this.putConfig(config);
      return true;
    }
    return false;
  }

  public async updateServer(server: IMCPServer) {
    const config = await this.getConfig();
    const index = config.servers.findIndex(
      (svr: IMCPServer) => svr.key === server.key,
    );
    if (index > -1) {
      config.servers[index] = server;
      await this.putConfig(config);
      return true;
    }
    return false;
  }

  public async activate(server: IMCPServer): Promise<{ error: any }> {
    try {
      const config = await this.getConfig();
      const mcpSvr = this.getMCPServer(server, config) as IMCPServer;
      const { key, command, args, env, transportType, url, authProvider } = mcpSvr;
      
      log(`Activating MCP server: ${key}, transport type: ${transportType}`);
      
      if (transportType === 'sse' && !this.SSETransport) {
        log('SSE 传输模块未正确加载', 'error');
        throw new Error('SSE 传输模块未正确加载，请重启应用后重试');
      }
      
      const client = new this.Client(
        {
          name: key,
          version: '1.0.0',
        },
        {
          capabilities: {},
        },
      );

      let transport;
      
      if (transportType === 'sse') {
        if (!url) {
          throw new Error('URL is required for SSE transport');
        }
        
        log(`Using SSE transport to connect to: ${url}`);
        
        try {
          log('Creating SSE transport object...');
          
          // 创建一个自定义的 EventSource 类，添加更多调试信息
          const OriginalEventSource = global.EventSource || EventSource;
          global.EventSource = function(url, options) {
            log(`Creating EventSource for URL: ${url}`);
            
            const eventSource = new OriginalEventSource(url, options);
            
            // 添加调试事件处理器
            const originalOnOpen = eventSource.onopen;
            eventSource.onopen = function(event) {
              log('EventSource.onopen called');
              if (originalOnOpen) originalOnOpen.call(eventSource, event);
            };
            
            const originalOnError = eventSource.onerror;
            eventSource.onerror = function(event) {
              log(`EventSource.onerror called: ${JSON.stringify(event)}`);
              if (originalOnError) originalOnError.call(eventSource, event);
            };
            
            const originalOnMessage = eventSource.onmessage;
            eventSource.onmessage = function(event) {
              log(`EventSource.onmessage called: ${event.data}`);
              if (originalOnMessage) originalOnMessage.call(eventSource, event);
            };
            
            // 添加对所有事件类型的监听
            const originalAddEventListener = eventSource.addEventListener;
            eventSource.addEventListener = function(type, listener, options) {
              log(`EventSource.addEventListener called for type: ${type}`);
              
              // 包装监听器以添加日志
              const wrappedListener = function(event) {
                log(`EventSource event '${type}' received: ${event.data}`);
                listener.call(eventSource, event);
              };
              
              return originalAddEventListener.call(eventSource, type, wrappedListener, options);
            };
            
            return eventSource;
          };
          
          // 修改 SSETransport 类，添加更多调试信息
          const originalSSETransport = this.SSETransport;
          this.SSETransport = function(...args) {
            log(`Creating SSETransport with args: ${JSON.stringify(args)}`);
            
            const transport = new originalSSETransport(...args);
            
            // 保存原始的 start 方法
            const originalStart = transport.start;
            transport.start = async function() {
              log('SSETransport.start called');
              
              // 创建一个新的 Promise 包装原始的 start 方法
              return new Promise((resolve, reject) => {
                // 设置超时
                const timeout = setTimeout(() => {
                  log('SSETransport.start timeout');
                  reject(new Error('SSE connection timeout'));
                }, 10000);
                
                // 调用原始的 start 方法
                originalStart.call(this)
                  .then(() => {
                    log('SSETransport.start completed successfully');
                    clearTimeout(timeout);
                    resolve();
                  })
                  .catch((error) => {
                    log(`SSETransport.start failed: ${error.message}`);
                    clearTimeout(timeout);
                    reject(error);
                  });
              });
            };
            
            // 保存原始的 onMessage 方法
            const originalOnMessage = transport.onMessage;
            transport.onMessage = function(callback) {
              log('SSETransport.onMessage called');
              
              // 包装回调以添加日志
              const wrappedCallback = function(message) {
                log(`Message received in onMessage: ${JSON.stringify(message)}`);
                callback(message);
              };
              
              originalOnMessage.call(this, wrappedCallback);
            };
            
            return transport;
          };
          
          // 使用修改后的 SSETransport
          const sseOptions = {
            eventSourceInit: {
              withCredentials: false
            }
          };
          
          if (authProvider) {
            sseOptions.authProvider = authProvider;
          }
          
          transport = new this.SSETransport(new URL(url), sseOptions);
          log('SSE transport object created successfully');
          
          // 拦截 Client.connect 方法
          const originalConnect = client.connect;
          client.connect = async function(transport) {
            log('Client.connect called');
            try {
              const result = await originalConnect.apply(this, arguments);
              log('Client.connect completed successfully');
              return result;
            } catch (error) {
              log(`Client.connect failed: ${error.message}`, 'error');
              throw error;
            }
          };
          
          log(`Connecting MCP client: ${key}`);
          
          // 使用较短的超时时间
          const connectPromise = client.connect(transport);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout (10s)')), 10000);
          });
          
          await Promise.race([connectPromise, timeoutPromise]);
          log(`MCP client connection successful: ${key}`);
          
          this.clients[key] = client;
          await this.updateConfigAfterActivation(mcpSvr, config);
          
          // 添加一个心跳检查，确保连接保持活跃
          const heartbeatInterval = setInterval(async () => {
            try {
              // 尝试调用一个简单的方法来检查连接是否活跃
              await client.listTools();
              log(`SSE connection heartbeat successful for: ${key}`);
            } catch (heartbeatError) {
              log(`SSE connection heartbeat failed for: ${key}: ${heartbeatError.message}`, 'error');
              
              // 如果心跳失败，尝试重新连接
              try {
                log(`Attempting to reconnect SSE for: ${key}`);
                await client.connect(transport);
                log(`SSE reconnection successful for: ${key}`);
              } catch (reconnectError) {
                log(`SSE reconnection failed for: ${key}: ${reconnectError.message}`, 'error');
                
                // 如果重连失败，清除心跳检查
                clearInterval(heartbeatInterval);
              }
            }
          }, 30000); // 每30秒检查一次
          
          // 存储心跳间隔引用，以便在关闭时清除
          client._heartbeatInterval = heartbeatInterval;
          
          return { error: null };
        } catch (error) {
          log(`SSE connection failed: ${error.message}`, 'error');
          throw error;
        }
      } else {
        let cmd: string = command;
        if (command === 'npx') {
          cmd = process.platform === 'win32' ? `${command}.cmd` : command;
        }
        
        const mergedEnv = {
          ...getDefaultEnvironment(),
          ...env,
          PATH: process.env.PATH,
        };
        
        transport = new this.StdioTransport({
          command: cmd,
          args,
          stderr: process.platform === 'win32' ? 'pipe' : 'inherit',
          env: mergedEnv,
        });
        
        const connectPromise = client.connect(transport);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout, please check if the server is running')), 30000);
        });
        
        try {
          await Promise.race([connectPromise, timeoutPromise]);
          log(`MCP client connection successful: ${key}`);
          
          this.clients[key] = client;
          await this.updateConfigAfterActivation(mcpSvr, config);
          return { error: null };
        } catch (connectError: any) {
          log(`MCP client connection failed: ${connectError.message}`, 'error');
          throw connectError;
        }
      }
    } catch (error: any) {
      log(`MCP server activation failed: ${error.message}`, 'error');
      log(error, 'error');
      this.deactivate(server.key);
      return { error };
    }
  }

  public async deactivate(key: string) {
    try {
      if (this.clients[key]) {
        // 清除心跳检查（如果存在）
        if (this.clients[key]._heartbeatInterval) {
          clearInterval(this.clients[key]._heartbeatInterval);
        }
        
        await this.clients[key].close();
        delete this.clients[key];
      }
      await this.updateConfigAfterDeactivation(key, await this.getConfig());
      return { error: null };
    } catch (error: any) {
      log(error, 'error');
      return { error };
    }
  }

  public async close() {
    for (const key in this.clients) {
      log(`Closing MCP Client ${key}`);
      
      // 清除心跳检查（如果存在）
      if (this.clients[key]._heartbeatInterval) {
        clearInterval(this.clients[key]._heartbeatInterval);
      }
      
      await this.clients[key].close();
      delete this.clients[key];
    }
  }

  public async listTools(key?: string) {
    let allTools: any = [];
    if (key) {
      if (!this.clients[key]) {
        throw new Error(`MCP Client ${key} not found`);
      }
      const { tools } = await this.clients[key].listTools();
      allTools = tools.map((tool: any) => {
        tool.name = `${key}--${tool.name}`;
        return tool;
      });
    } else {
      for (const clientName in this.clients) {
        const { tools } = await this.clients[clientName].listTools();
        allTools = allTools.concat(
          tools.map((tool: any) => {
            tool.name = `${clientName}--${tool.name}`;
            return tool;
          }),
        );
      }
    }
    // logging.debug('All Tools:', JSON.stringify(allTools, null, 2));
    return allTools;
  }

  public async callTool({
    client,
    name,
    args,
  }: {
    client: string;
    name: string;
    args: any;
  }) {
    if (!this.clients[client]) {
      throw new Error(`MCP Client ${client} not found`);
    }
    log('Calling:', client, name, args);
    const result = await this.clients[client].callTool({
      name,
      arguments: args,
    });
    return result;
  }

  public getClient(name: string) {
    return this.clients[name];
  }

  public getClientNames() {
    return Object.keys(this.clients);
  }
}
