import { number, z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { JigsawStack } from "jigsawstack";
import fs from "fs";
import path from "path";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  McpError,
  ErrorCode,
  TextContent,
  ImageContent,
} from "@modelcontextprotocol/sdk/types.js";

const JIGSAWSTACK_API_KEY = process.env.JIGSAWSTACK_API_KEY;

console.log("Checking for JIGSAWSTACK_API_KEY");

if (!JIGSAWSTACK_API_KEY) {
  throw new Error("JIGSAWSTACK_API_KEY environment variable is required");
}

console.log("Creating JigsawStack client");
// Create a new JigsawStack client //
const jigsawStackClient = JigsawStack({
  apiKey: JIGSAWSTACK_API_KEY,
});

console.log("JigsawStack client created");

// console.log("Testing the image_generation function");
// const result = jigsawStackClient.image_generation({
//   prompt: "A beautiful sunset over the ocean.",
//   model: "sd1.5",
//   size: "medium",
//   advance_config: {
//     steps: 50,
//   },
// });

// console.log("Image generation function tested");
// console.log("Result: ", await result);

/* image_generation: (params: {
  prompt: string;
  model?: "sd1.5" | "sdxl" | "ead1.0" | "rv1.3" | "rv3" | "rv5.1" | "ar1.8";
  size?: "small" | "medium" | "large";
  width?: number;
  height?: number;
  advance_config?: {
      negative_prompt?: string;
      steps?: number;
      guidance?: string;
      seed?: number;
      scheduler?: "dpmsolver++" | "lms" | "ddim" | "euler" | "euler_a" | "pndm";
  };
}) */

/*
Supported Aspec
1:1
16:9
21:9
3:2
2:3
4:5
5:4
3:4
4:3
9:16
9:21
*/

const generateImage = async (prompt: string, steps: string | number | undefined, negative_prompt: string) => {
  const parsedSteps = steps !== undefined ? Number(steps) : undefined;
  const result = await jigsawStackClient.image_generation({
    prompt: prompt,
    steps: parsedSteps,
    advance_config: {
      negative_prompt: negative_prompt,
    },
  });

  if (!result || !result.blob) {
    throw new Error("Image generation failed or returned no result.");
  }

  const generatedImage = await result.blob();
  const uploadResult = await jigsawStackClient.store.upload(generatedImage, {
    temp_public_url: true,
  });

  if (!uploadResult || !uploadResult.temp_public_url) {
    throw new Error("Failed to return the image URL.");
  }
  return uploadResult.temp_public_url;
};

const IMAGE_GENERATION: Tool = {
  name: "image_generation",
  description: "Generate images using JigsawStack's image generation API.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The prompt to generate the image." },
      steps: { type: "string", description: "The number of steps for image generation." },
      aspect_ratio: {
        type: "string",
        description: "The aspect ratio for the image. Supported values: '1:1', 16:9, 21:9, 3:2, 2:3, 4:5, 5:4, 3:4, 4:3, 9:16, 9:21.",
      },
      negative_prompt: { type: "string", description: "Negative prompt to avoid certain elements." },
    },
    required: ["prompt"],
  },
};

const server: Server = new Server(
  {
    name: "Image Generation",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {
        IMAGE_GENERATION: IMAGE_GENERATION,
      },
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [IMAGE_GENERATION],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "image_generation": {
      try {
        const { prompt, aspect_ratio, steps, negative_prompt } = request.params.arguments as {
          prompt: string;
          aspect_ratio: string | undefined;
          steps: number | undefined | string;
          negative_prompt: string;
        };

        try {
          if (steps !== undefined) {
            Number(steps);
          }
        } catch (error) {
          throw new McpError(ErrorCode.InvalidParams, `Invalid steps value: ${steps}`);
        }

        const result = await generateImage(prompt, steps, negative_prompt);

        //return ImageContent
        const content = [
          {
            type: "text",
            text: result,
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
