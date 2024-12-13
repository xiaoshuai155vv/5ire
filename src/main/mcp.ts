export interface ClientConfig {
  name: string;
  command: string;
  args: string[];
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

  public async activate(config: ClientConfig) {
    const { name, command, args } = config;
    const client = new this.Client(
      {
        name: name,
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
    client.connect(transport);
    this.clients[name] = client;
    return client;
  }

  public async deactivate(name: string) {
    if (this.clients[name]) {
      this.clients[name].close();
      delete this.clients[name];
    }
  }

  public async listTools(name?: string) {
    let allTools: any = [];
    if (name) {
      if (!this.clients[name]) {
        throw new Error(`MCP Client ${name} not found`);
      }
      const { tools } = await this.clients[name].listTools();
      allTools = tools.map((tool: any) => {
        tool.name = `${name}-000-${tool.name}`;
        return tool;
      });
    } else {
      for (const key in this.clients) {
        const { tools } = await this.clients[key].listTools();
        allTools = allTools.concat(
          tools.map((tool: any) => {
            tool.name = `${key}-000-${tool.name}`;
            return tool;
          })
        );
      }
    }
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
    return result
  }

  public getClient(name: string) {
    return this.clients[name];
  }
}
