import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack AI Scraper",
    version: "0.0.1",
    description: "JigsawStack AI Scraper MCP Server",
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
    case "ai-scraper": {
      const {
        url,
        root_element_selector,
        page_position,
        http_headers,
        reject_request_pattern,
        goto_options,
        wait_for,
        advance_config,
        size_preset,
        is_mobile,
        scale,
        width,
        height,
        cookies,
        force_rotate_proxy,
        byo_proxy,
        selectors,
        element_prompts,
      } = request.params.arguments as {
        url: string;
        root_element_selector?: string;
        page_position?: number;
        http_headers?: object;
        reject_request_pattern?: string[];
        goto_options?: { timeout: number; wait_until: string };
        wait_for?: { mode: string; value: string | number };
        advance_config?: { console: boolean; network: boolean; cookies: boolean };
        size_preset?: string;
        is_mobile?: boolean;
        scale?: number;
        width?: number;
        height?: number;
        cookies?: object[];
        force_rotate_proxy?: boolean;
        byo_proxy?: { server: string; auth?: { username: string; password: string } };
        selectors?: string[];
        element_prompts?: string[];
      };
      try {
        const result = await jigsawStackClient.web.ai_scrape({
          url,
          root_element_selector,
          page_position,
          http_headers,
          reject_request_pattern,
          goto_options,
          wait_for,
          advance_config,
          size_preset,
          is_mobile,
          scale,
          width,
          height,
          force_rotate_proxy,
          byo_proxy,
          selectors,
          element_prompts: element_prompts ?? [],
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to scrape website: ${(error as Error).message}` }], isError: true };
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
