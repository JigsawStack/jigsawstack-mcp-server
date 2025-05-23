import { JigsawStack } from "jigsawstack";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool, McpError, ErrorCode, TextContent } from "@modelcontextprotocol/sdk/types.js";

const AI_WEB_SEARCH: Tool = {
  name: "ai_web_search",
  description: "Perform a JigsawStack search powered by AI. Get better. Faster. Smarter. Results.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      ai_overview: { type: "boolean", description: "AI overview" },
      safe_search: { type: "string", enum: ["strict", "moderate", "off"], description: "Safe search level" },
      spell_check: { type: "boolean", description: "Spell check" },
    },
    required: ["query"],
  },
};

console.log("Creating a new instance of Server.");
const server: Server = new Server(
  {
    name: "ai-web-search",
    version: "0.1.1",
  },
  {
    capabilities: {
      tools: {
        ai_web_search: AI_WEB_SEARCH,
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

const search = async (
  query: string,
  ai_overview: boolean | undefined,
  safe_search: "strict" | "moderate" | "off" | undefined,
  spell_check: boolean | undefined
): Promise<string> => {
  const payload: any = {};
  if (query) payload.query = query;
  if (ai_overview !== undefined) payload.ai_overview = ai_overview;
  if (safe_search) payload.safe_search = safe_search;
  if (spell_check !== undefined) payload.spell_check = spell_check;

  const result = await jigsawStackClient.web.search(payload);
  return JSON.stringify(result, null, 2);
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [AI_WEB_SEARCH],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "ai_web_search":
      const { query, ai_overview, safe_search, spell_check } = request.params.arguments as {
        query: string;
        ai_overview?: boolean;
        safe_search?: "strict" | "moderate" | "off";
        spell_check?: boolean;
      };
      try {
        const result = await search(query, ai_overview, safe_search, spell_check);
        return { content: [{ type: "text", text: result }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to perform search: ${(error as Error).message}` }], isError: true };
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
