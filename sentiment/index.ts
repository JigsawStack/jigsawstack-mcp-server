import { JigsawStack } from "jigsawstack";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const SENTIMENT: Tool = {
  name: "sentiment",
  description: "Analyze the sentiment of your text with AI, powered by JigsawStack",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The text to analyze",
      },
    },
    required: ["text"],
  },
};

const server: Server = new Server(
  {
    name: "sentiment",
    version: "0.1.1",
  },
  {
    capabilities: {
      tools: {
        sentiment: SENTIMENT,
      },
    },
  }
);

const JIGSAWSTACK_API_KEY = process.env.JIGSAWSTACK_API_KEY;

if (!JIGSAWSTACK_API_KEY) {
  throw new Error("JIGSAWSTACK_API_KEY environment variable is required");
}

// Create a new JigsawStack client //
const jigsawStackClient = JigsawStack({
  apiKey: JIGSAWSTACK_API_KEY,
});

const analyze = async (
  text: string,
): Promise<string> => {
  const payload: any = {};
  if (text) payload.text = text;

  const result = await jigsawStackClient.sentiment(payload);
  return JSON.stringify(result, null, 2);
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [SENTIMENT],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "sentiment":
      const { text } = request.params.arguments as {
        text: string;
      };
      try {
        const result = await analyze(text);
        return { content: [{ type: "text", text: result }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to perform analysis: ${(error as Error).message}` }], isError: true };
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
