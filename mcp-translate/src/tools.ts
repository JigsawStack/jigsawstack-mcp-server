import { Tool } from "@modelcontextprotocol/sdk/types.js";

const TRANSLATE: Tool = {
  name: "translate",
  description: "Translate text to a different language",
  inputSchema: {
    type: "object",
    required: ["text", "target_language"],
    properties: {
    text: { type: "string", description: "The text to translate." },
    target_language: { type: "string", description: "The target language to translate to." },
  },
  },
};

export { TRANSLATE };