import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack Web Search",
    version: "0.0.1",
    description: "JigsawStack Web Search MCP Server",
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

    case "web-search": {
      const { query, spell_check, safe_search, ai_overview, byo_urls, country_code, auto_scrape } = request.params.arguments as {
        query: string;
        spell_check?: boolean;
        safe_search?: "strict" | "moderate" | "off";
        ai_overview?: boolean;
        byo_urls?: string[];
        country_code?: string;
        auto_scrape?: boolean;
      };
      try {
        const result = await jigsawStackClient.web.search({ query, spell_check, safe_search, ai_overview, byo_urls, country_code, auto_scrape });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to search the web: ${(error as Error).message}` }], isError: true };
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
