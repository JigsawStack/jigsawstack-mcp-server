import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack Speech to Text",
    version: "0.0.1",
    description: "JigsawStack Speech to Text MCP Server",
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

    case "speech-to-text": {
      const {
        url,
        file_store_key,
        language,
        translate,
        by_speaker,
        webhook_url,
        batch_size,
        chunk_duration,
      } = request.params.arguments as {
        url?: string;
        file_store_key?: string;
        language?: string;
        translate?: boolean;
        by_speaker?: boolean;
        webhook_url?: string;
        batch_size?: number;
        chunk_duration?: number;
      };
      try {
        const result = await jigsawStackClient.audio.speech_to_text({
          url,
          file_store_key,
          language,
          translate,
          by_speaker,
          webhook_url,
          batch_size,
          chunk_duration,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to convert speech to text: ${(error as Error).message}` }], isError: true };
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
