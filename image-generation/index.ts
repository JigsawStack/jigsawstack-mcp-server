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

const generateImage = async (
  prompt: string,
  steps: string | number | undefined,
  negative_prompt: string,
) => {
  const parsedSteps = steps !== undefined ? Number(steps) : undefined;
  const result = await jigsawStackClient.image_generation({
    prompt: prompt,
    advance_config: {
      negative_prompt: negative_prompt,
      steps: parsedSteps,
    }
  });
  return result;
};

const IMAGE_GENERATION: Tool = {
  name: "IMAGE_GENERATION",
  description: "Generate images using JigsawStack's image generation API.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The prompt to generate the image." },
      steps: { type: "number", description: "The number of steps for image generation.", minimum: 1, maximum: 90, default: 50 },
      negative_prompt: { type: "string", description: "Negative prompt to avoid certain elements." },
    },
    required: ["prompt"]
  }
};

console.log("Creating a new instance of Server.");
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

console.log("Setting up server request handler, to return the tools");
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [IMAGE_GENERATION],
}));

console.log("Setting up server request handler, to handle the request");
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "IMAGE_GENERATION": {
      try {
        const { prompt, steps, negative_prompt } = request.params.arguments as {
          
          prompt: string,
          steps: number | undefined | string,
          negative_prompt: string,
        };
        const result = await generateImage(prompt, steps, negative_prompt);

        // convert the image from blob and return it as base64 content
        const blob = await result.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Image = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        
        //return ImageContent
        const ImageContent = {
          type: "image",
          base64: base64Image,
          mimeType: "image/png",
        };
        return { ImageContent };
      } catch (error: any) {
        console.error("Error processing IMAGE_GENERATION request:", error);
        const content = [{
          type: "text",
          text: error.message
        }];
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
console.log("We gucci, lesgoooo!");




