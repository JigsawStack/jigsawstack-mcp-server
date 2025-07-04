import { Tool } from "@modelcontextprotocol/sdk/types.js";

const DEEP_RESEARCH: Tool = {
  name: "deep-research",
  description: "Perform deep research on a given topic",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The research query." },
      spell_check: { type: "boolean", description: "Enable spell check for the query." },
      safe_search: {
        type: "string",
        enum: ["strict", "moderate", "off"],
        description: "Safe search mode.",
      },
      ai_overview: { type: "boolean", description: "Enable AI overview in results." },
      byo_urls: {
        type: "array",
        items: { type: "string" },
        description: "Bring your own URLs to research within.",
      },
      country_code: { type: "string", description: "Country code for localized research." },
      auto_scrape: { type: "boolean", description: "Automatically scrape results." },
      deep_research_config: {
        type: "object",
        properties: {
          max_depth: { type: "number", description: "Maximum depth for research." },
          max_breadth: { type: "number", description: "Maximum breadth for research." },
          max_output_tokens: { type: "number", description: "Maximum output tokens." },
          target_output_tokens: { type: "number", description: "Target output tokens." },
        },
        description: "Configuration for deep research mode.",
      },
    },
    required: ["query"],
  },
};

const tools = [DEEP_RESEARCH];

export default tools;