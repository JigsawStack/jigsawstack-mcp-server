import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack Sentiment",
    version: "0.0.1",
    description: "JigsawStack Sentiment MCP Server",
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
    case "sentiment": {
      const { text } = request.params.arguments as {
        text: string;
      };
      try {
        const result = await analyze(text);
        return { content: [{ type: "text", text: result }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to perform analysis: ${(error as Error).message}` }], isError: true };
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
