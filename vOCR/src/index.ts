import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack",
    version: "0.1.1",
    description: "JigsawStack MCP Server",
  },
  {
    capabilities: {
      tools: {
        ...tools,
      },
    },
  }
);



const analyze = async (
  text: string,
): Promise<string> => {
  const payload: any = {};
  if (text) payload.text = text;

  const result = await jigsawStackClient.sentiment(payload);
  return JSON.stringify(result, null, 2);
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "vocr": {
      const { prompt, url, file_store_key, page_range } = request.params.arguments as {
        prompt: string | string[];
        url?: string;
        file_store_key?: string;
        page_range?: number[];
      };
      try {
        const result = await jigsawStackClient.vision.vocr({
          prompt,
          url,
          file_store_key,
          page_range,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to extract text: ${(error as Error).message}` }], isError: true };
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
