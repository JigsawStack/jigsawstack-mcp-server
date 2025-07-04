import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack Image Generation",
    version: "0.0.1",
    description: "JigsawStack Image Generation MCP Server",
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
    case "image-generation": {
      try {
        const {
          prompt,
          aspect_ratio,
          width,
          height,
          steps,
          output_format,
          return_type,
          advance_config,
          url,
          file_store_key,
        } = request.params.arguments as {
          prompt: string;
          aspect_ratio?: string;
          width?: number;
          height?: number;
          steps?: number;
          output_format?: "png" | "svg";
          return_type?: "url" | "binary" | "base64";
          advance_config?: {
            negative_prompt?: string;
            guidance?: number;
            seed?: number;
          };
          url?: string;
          file_store_key?: string;
        };

        ["steps", "width", "height"].forEach((field) => {
          const value = (request.params.arguments as any)[field];
          if (value !== undefined && isNaN(Number(value))) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid ${field} value: ${value}`);
          }
        });
        if (advance_config) {
          ["guidance", "seed"].forEach((field) => {
            const value = (advance_config as any)[field];
            if (value !== undefined && isNaN(Number(value))) {
              throw new McpError(ErrorCode.InvalidParams, `Invalid advance_config.${field} value: ${value}`);
            }
          });
        }

        const result = await jigsawStackClient.image_generation({
          prompt,
          aspect_ratio: aspect_ratio as (
            | "1:1" | "16:9" | "21:9" | "3:2" | "2:3" | "4:5" | "5:4" | "3:4" | "4:3" | "9:16" | "9:21"
            | undefined
          ),
          width: width !== undefined ? Number(width) : undefined,
          height: height !== undefined ? Number(height) : undefined,
          steps: steps !== undefined ? Number(steps) : undefined,
          output_format,
          return_type: return_type || "url",
          advance_config: advance_config
            ? {
              negative_prompt: advance_config.negative_prompt,
              guidance:
                advance_config.guidance !== undefined
                  ? Number(advance_config.guidance)
                  : undefined,
              seed:
                advance_config.seed !== undefined
                  ? Number(advance_config.seed)
                  : undefined,
            }
            : undefined,
          url,
          file_store_key,
        });

        const content = [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ];
        return { content };
      } catch (error: any) {
        console.error("Error processing IMAGE_GENERATION request:", error);
        const content = [
          {
            type: "text",
            text: error.message,
          },
        ];
        return { content };
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
