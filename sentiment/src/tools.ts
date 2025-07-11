import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const SENTIMENT: Tool = {
  name: "sentiment",
  description: "Analyze the sentiment of your text with AI, powered by JigsawStack",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The text to analyze",
      },
    },
    required: ["text"],
  },
};


const tools = [SENTIMENT];

export default tools;