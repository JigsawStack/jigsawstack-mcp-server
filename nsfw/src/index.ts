import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack NSFW",
    version: "0.0.1",
    description: "JigsawStack NSFW MCP Server",
  },
  {
    capabilities: {
      tools: {
        ...tools,
      },
    },
  }
);





server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "nsfw": {
      const { url, file_store_key } = request.params.arguments as {
        url?: string;
        file_store_key?: string;
      };
      try {
        const result = await jigsawStackClient.validate.nsfw({ url, file_store_key });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to validate NSFW: ${(error as Error).message}` }], isError: true };
      }
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
