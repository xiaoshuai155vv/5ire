import * as logging from './logging';
import path from 'path';
import fs from 'node:fs';
import { app } from 'electron';
export interface IClientConfig {
  key: string;
  command: 'npx' | 'uvx';
  args: string[];
  env?: Record<string, string>;
}

export default class ModuleContext {
  private clients: { [key: string]: any } = {};
  private Client: any;
  private Transport: any;
  private cfgPath: string;
  constructor() {
    this.cfgPath = path.join(app.getPath('userData'), 'mcp.json');
  }

  public async init() {
    this.Client = await this.importClient();
    this.Transport = await this.importTransport();
  }

  private async importClient() {
    const { Client } = await import(
      '@modelcontextprotocol/sdk/client/index.js'
    );
    return Client;
  }

  private async importTransport() {
    const { StdioClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/stdio.js'
    );
    return StdioClientTransport;
  }

  public async getConfig() {
    const defaultConfig = { servers: [] };
    try {
      if (!fs.existsSync(this.cfgPath)) {
        fs.writeFileSync(this.cfgPath, JSON.stringify(defaultConfig, null, 2));
      }
      const config = JSON.parse(fs.readFileSync(this.cfgPath, 'utf-8'));
      return config;
    } catch (err: any) {
      logging.captureException(err);
      return defaultConfig;
    }
  }

  public async putConfig(config: any) {
    try {
      fs.writeFileSync(this.cfgPath, JSON.stringify(config, null, 2));
      return true;
    } catch (err: any) {
      logging.captureException(err);
      return false;
    }
  }

  public async load() {
    const { servers } = await this.getConfig();
    for (const server of servers) {
      logging.debug('Activating server:', server.key);
      const { error } = await this.activate(server);
      if (error) {
      }
    }
  }

  public async activate(config: IClientConfig): Promise<{ error: any }> {
    try {
      const { key, command, args, env } = config;
      const client = new this.Client(
        {
          name: key,
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );
      const transport = new this.Transport({
        command,
        args,
        env: { ...env, PATH: process.env.PATH },
      });
      await client.connect(transport);
      this.clients[key] = client;
      return { error: null };
    } catch (err: any) {
      logging.captureException(err);
      return { error: err };
    }
  }

  public async deactivate(key: string) {
    try {
      if (this.clients[key]) {
        await this.clients[key].close();
        delete this.clients[key];
      }
      return true;
    } catch (err: any) {
      logging.captureException(err);
      return false;
    }
  }

  public async close() {
    for (const key in this.clients) {
      logging.info(`Closing MCP Client ${key}`);
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
      for (const key in this.clients) {
        const { tools } = await this.clients[key].listTools();
        allTools = allTools.concat(
          tools.map((tool: any) => {
            tool.name = `${key}--${tool.name}`;
            return tool;
          })
        );
      }
    }
    //log.debug('All Tools:', JSON.stringify(allTools, null, 2));
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
    logging.debug('Calling:', client, name, args);
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
