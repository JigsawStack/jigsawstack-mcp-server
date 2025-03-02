declare module "./src/tools/web.js" {
  import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
  export function registerWebTools(server: McpServer): void;
}