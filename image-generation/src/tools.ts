import { Tool } from "@modelcontextprotocol/sdk/types.js";


const IMAGE_GENERATION: Tool = {
  name: "image-generation",
  description: "Generate an image from a given text",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The prompt to generate the image." },
      aspect_ratio: {
        type: "string",
        description: "The aspect ratio for the image.",
        enum: [
          "1:1", "16:9", "21:9", "3:2", "2:3", "4:5", "5:4", "3:4", "4:3", "9:16", "9:21"
        ],
      },
      width: { type: "number", description: "The width of the image in pixels." },
      height: { type: "number", description: "The height of the image in pixels." },
      steps: { type: "number", description: "The number of steps for image generation." },
      output_format: {
        type: "string",
        description: "The output format of the image.",
        enum: ["png", "svg"],
      },
      return_type: {
        type: "string",
        description: "The return type for the image.",
        enum: ["url", "binary", "base64"],
      },
      advance_config: {
        type: "object",
        description: "Advanced configuration options.",
        properties: {
          negative_prompt: { type: "string", description: "Negative prompt to avoid certain elements." },
          guidance: { type: "number", description: "Guidance scale for image generation." },
          seed: { type: "number", description: "Random seed for image generation." },
        },
      },
      url: { type: "string", description: "Optional URL for image input." },
      file_store_key: { type: "string", description: "Optional file store key." },
    },
    required: ["prompt"],
  },
};


const tools = [IMAGE_GENERATION];

export default tools;