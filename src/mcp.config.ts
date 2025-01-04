import { IMCPConfig } from "stores/useMCPStore";

export default {
  servers: [
    /** not working, no clues
    {
      key: 'Cloudflare',
      command: 'npx',
      description: 'MCP server for interacting with Cloudflare API',
      args: [
        '-y',
        '@cloudflare/mcp-server-cloudflare',
        'run',
        '<accountId:string:You can find your AccountID on the right side of the "Workers and Pages" page.>',
      ],
      isActive: false,
    },
     */
    {
      key: 'Web',
      command: 'uvx',
      description:
        'A Model Context Protocol server that provides web content fetching capabilities',
      args: ['mcp-server-fetch'],
      isActive: false,
    },
    {
      key: 'FileSystem',
      command: 'npx',
      description:
        'The server will only allow operations within directories specified via args',
      args: [
        '-y',
        '@modelcontextprotocol/server-filesystem',
        '<dirs:list: directories you about to access>',
      ],
      isActive: false,
    },
    {
      key: 'Git',
      command: 'uvx',
      description:
        'A Model Context Protocol (MCP) server implementation that provides database interaction and business intelligence capabilities through SQLite. This server enables running SQL queries, analyzing business data, and automatically generating business insight memos.',
      args: [
        'mcp-server-git',
        '--repository',
        '<repoPath:string:Git Repository Path>',
      ],
      isActive: false,
    },
    {
      key: 'MacOs',
      command: 'npx',
      description:
        'A Model Context Protocol server that provides macOS-specific system information and operations.',
      args: ['-y', '@mcp-get-community/server-macos'],
      isActive: false,
    },
    {
      key: 'Obsidian',
      command: 'npx',
      description:
        'This is a connector to allow Claude Desktop (or any MCP client) to read and search any directory containing Markdown notes (such as an Obsidian vault).',
      args: [
        '-y',
        'mcp-obsidian',
        '<vaultPath:string:Folder where md files are stored>',
      ],
      isActive: false,
    },
    {
      key: 'Postgres',
      command: 'npx',
      description:
        'A Model Context Protocol server that provides read-only access to PostgreSQL databases. This server enables LLMs to inspect database schemas and execute read-only queries.',
      args: [
        '-y',
        '@modelcontextprotocol/server-postgres',
        '<connectionString:string:like postgresql://localhost/db>',
      ],
      isActive: false,
    },
    {
      key: 'Linear',
      command: 'npx',
      description:
        "This server provides integration with Linear's issue tracking system through MCP, allowing LLMs to interact with Linear issues.",
      args: ['-y', 'mcp-linear'],
      env: {
        LINEAR_API_KEY: '<apiKey:string:Get the api key from linear.app>',
      },
      isActive: false,
    },
    {
      key: 'Search1api',
      command: 'npx',
      description:
        'A Model Context Protocol (MCP) server that provides search and crawl functionality using Search1API.',
      args: ['-y', 'search1api-mcp'],
      env: {
        SEARCH1API_KEY:
          '<apiKey:string:Get the api key from www.search1api.com>',
      },
      isActive: false,
    },
    {
      key: 'Shell',
      command: 'npx',
      description:
        'A Node.js implementation of the Model Context Protocol (MCP) that provides secure shell command execution capabilities. This server allows AI models to execute shell commands in a controlled environment with built-in security measures.',
      args: ['-y', 'mcp-shell'],
      isActive: false,
    },
    {
      key: 'Sqlite',
      command: 'uvx',
      description:
        'A Model Context Protocol (MCP) server implementation that provides database interaction and business intelligence capabilities through SQLite. This server enables running SQL queries, analyzing business data, and automatically generating business insight memos.',
      args: [
        'mcp-server-sqlite',
        '--db-path',
        '<dbPath:string: Sqlite database file path>',
      ],
      isActive: false,
    },
    {
      key: 'Time',
      command: 'uvx',
      description:
        'A Model Context Protocol server providing tools for time queries and timezone conversions for LLMs',
      args: [
        'mcp-server-time',
        '--local-timezone=<timezone:string:like Asia/Shanghai. You may need install tzdata first>',
      ],
      isActive: false,
    },
    {
      key: 'Sequential Thinking',
      command: 'npx',
      description:
        'An MCP server implementation that provides a tool for dynamic and reflective problem-solving through a structured thinking process.',
      args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
      isActive: false,
    },
  ],
} as IMCPConfig;
