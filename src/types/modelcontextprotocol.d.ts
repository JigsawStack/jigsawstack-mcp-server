declare module '@modelcontextprotocol/sdk/server/mcp' {
  export class McpServer {
    constructor(config: { name: string; version: string; description: string });
    tool(name: string, schema: any, implementation: (args: any) => Promise<any>): void;
    connect(transport: any): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio' {
  export class StdioServerTransport {
    constructor();
  }
}
