import { Tool } from "@modelcontextprotocol/sdk/types.js";

const NSFW: Tool = {  
  name: "nsfw",
  description: "Validate if an image is NSFW",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL for the image input." },
        file_store_key: { type: "string", description: "Optional file store key." },
      },
      required: ["url"],  
    },
};

const tools = [NSFW];

export default tools;