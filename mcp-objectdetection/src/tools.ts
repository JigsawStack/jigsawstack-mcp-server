import { Tool } from "@modelcontextprotocol/sdk/types.js";


const OBJECT_DETECTION: Tool = {
  name: "object-detection",
  description: "Detect objects in an image",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL for the image input." },
      file_store_key: { type: "string", description: "Optional file store key." },
      prompts: {
        type: "array",
        items: { type: "string" },
        description: "Prompts to guide object detection.",
      },
      features: {
        type: "array",
        items: {
          type: "string",
          enum: ["object_detection", "gui"],
        },
        description: "Features to enable for detection.",
      },
      annotated_image: { type: "boolean", description: "Whether to return an annotated image." },
    },
  },
};
const tools = [OBJECT_DETECTION];

export default tools;