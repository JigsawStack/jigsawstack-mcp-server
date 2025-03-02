import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerWebTools } from "./src/tools/web.js";

//creating a new MCP server instance
const server = new McpServer({
  name: "JigsawStackMCPServer",
  version: "0.1.0",
  description: "An MCP server for JigsawStack",
});

registerWebTools(server);

//creating a new stdio server transport instance for the server
const transport = new StdioServerTransport();

console.log("Connecting server...");
await server.connect(transport);
console.log("Server connected and listening for requests.");
