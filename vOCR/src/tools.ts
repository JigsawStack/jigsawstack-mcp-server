import { Tool } from "@modelcontextprotocol/sdk/types.js";

const VOCR: Tool = {
  name: "vocr",
  description: "Extract text from an image",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        oneOf: [
          { type: "string", description: "Prompt for OCR extraction." },
          {
            type: "array",
            items: { type: "string" },
            description: "Array of prompts for OCR extraction.",
          },
        ],
        description: "Prompt(s) for OCR extraction.",
      },
      url: { type: "string", description: "URL for the image input." },
      file_store_key: { type: "string", description: "Optional file store key." },
      page_range: {
        type: "array",
        items: { type: "number" },
        description: "Page range to extract from (for multi-page files).",
      },
    },
    required: ["prompt"],
  },
};

const tools = [VOCR];

export default tools;