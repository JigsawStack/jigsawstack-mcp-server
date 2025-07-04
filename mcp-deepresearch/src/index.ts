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




server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {

    case "deep-research": {
      const { query, spell_check, safe_search, ai_overview, byo_urls, country_code, auto_scrape, deep_research_config } = request.params.arguments as {
        query: string;
        spell_check?: boolean;
        safe_search?: "strict" | "moderate" | "off";
        ai_overview?: boolean;
        byo_urls?: string[];
        country_code?: string;
        auto_scrape?: boolean;
        deep_research_config?: {
          max_depth?: number;
          max_breadth?: number;
          max_output_tokens?: number;
          target_output_tokens?: number;
        };
      };
      try {
        const result = await jigsawStackClient.web.search({ query, spell_check, safe_search, ai_overview, byo_urls, country_code, auto_scrape, deep_research: true, deep_research_config });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to perform deep research: ${(error as Error).message}` }], isError: true };
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
