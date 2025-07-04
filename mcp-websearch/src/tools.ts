import { Tool } from "@modelcontextprotocol/sdk/types.js";

const WEB_SEARCH: Tool = {
  name: "web-search",
  description: "Search the web",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query." },
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
        description: "Bring your own URLs to search within.",
      },
      country_code: { type: "string", description: "Country code for localized search." },
      auto_scrape: { type: "boolean", description: "Automatically scrape results." },
    },
    required: ["query"],
  },
};


const tools = [WEB_SEARCH];

export default tools;