import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack Text to Speech",
    version: "0.0.1",
    description: "JigsawStack Text to Speech MCP Server",
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

    case "text-to-speech": {
      const { text, accent, voice_clone_id } = request.params.arguments as {
        text: string;
        accent?: string;
        voice_clone_id?: string;
      };
      try {
        const result = await jigsawStackClient.audio.text_to_speech({ text, accent: accent as any, voice_clone_id, return_type: "url" });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to convert text to speech: ${(error as Error).message}` }], isError: true };
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
