import log from 'electron-log';
import * as Sentry from '@sentry/electron/main';
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
  constructor() {}

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

  public async activate(config: IClientConfig): Promise<boolean> {
    try {
      const { key, command, args } = config;
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
      });
      await client.connect(transport);
      this.clients[key] = client;
      return true;
    } catch (err) {
      log.error(err);
      Sentry.captureException(err);
      return false;
    }
  }

  public async deactivate(key: string) {
    try {
      if (this.clients[key]) {
        await this.clients[key].close();
        delete this.clients[key];
      }
      return true;
    } catch (err) {
      log.error(err);
      Sentry.captureException(err);
      return false;
    }
  }

  public async close() {
    for (const key in this.clients) {
      log.info(`Closing MCP Client ${key}`);
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
    log.debug('All Tools:', JSON.stringify(allTools, null, 2));
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
    const result = await this.clients[client].callTool({
      name,
      arguments: args,
    });
    return result;
  }

  public getClient(name: string) {
    return this.clients[name];
  }
}
