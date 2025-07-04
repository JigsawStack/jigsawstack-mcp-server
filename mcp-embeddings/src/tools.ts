import { Tool } from "@modelcontextprotocol/sdk/types.js";


export const EMBEDDINGS: Tool = {
  name: "embeddings",
  description: "Generate embeddings for a given text, pdf or image",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The text to generate embeddings for",
      },
      type: {
        type: "string",
        description: "The type of content to generate embeddings for",
        enum: ["text", "image", "audio", "text-other", "pdf"],
      },
      token_overflow_mode: {  
        type: "string",
        description: "The mode to handle token overflow",
        enum: ["truncate", "error"],
      },
    },
    required: ["text", "type", "token_overflow_mode"],
  },
};

const tools = [ EMBEDDINGS ]

export default tools;