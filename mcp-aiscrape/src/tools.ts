import { Tool } from "@modelcontextprotocol/sdk/types.js";

const AI_SCRAPER: Tool = {
  name: "ai-scraper",
  description: "Scrape a website",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL of the website to scrape." },
      root_element_selector: { type: "string", description: "Root element selector for scraping." },
      page_position: { type: "number", description: "Page position for scraping." },
      http_headers: { type: "object", description: "HTTP headers to use for the request." },
      reject_request_pattern: {
        type: "array",
        items: { type: "string" },
        description: "Patterns for requests to reject during scraping.",
      },
      goto_options: {
        type: "object",
        properties: {
          timeout: { type: "number", description: "Timeout for navigation." },
          wait_until: { type: "string", description: "When to consider navigation succeeded." },
        },
        description: "Options for page navigation.",
      },
      wait_for: {
        type: "object",
        properties: {
          mode: { type: "string", description: "Wait mode." },
          value: { oneOf: [ { type: "string" }, { type: "number" } ], description: "Wait value." },
        },
        description: "Wait for a specific condition before scraping.",
      },
      advance_config: {
        type: "object",
        properties: {
          console: { type: "boolean", description: "Capture console logs." },
          network: { type: "boolean", description: "Capture network logs." },
          cookies: { type: "boolean", description: "Capture cookies." },
        },
        description: "Advanced configuration options.",
      },
      size_preset: { type: "string", description: "Preset for viewport size." },
      is_mobile: { type: "boolean", description: "Whether to emulate a mobile device." },
      scale: { type: "number", description: "Scale factor for rendering." },
      width: { type: "number", description: "Viewport width." },
      height: { type: "number", description: "Viewport height." },
      cookies: {
        type: "array",
        items: { type: "object" },
        description: "Cookies to use for the request.",
      },
      force_rotate_proxy: { type: "boolean", description: "Force proxy rotation." },
      byo_proxy: {
        type: "object",
        properties: {
          server: { type: "string", description: "Proxy server address." },
          auth: {
            type: "object",
            properties: {
              username: { type: "string", description: "Proxy username." },
              password: { type: "string", description: "Proxy password." },
            },
          },
        },
        description: "Bring your own proxy configuration.",
      },
      selectors: {
        type: "array",
        items: { type: "string" },
        description: "Selectors for elements to scrape.",
      },
      element_prompts: {
        type: "array",
        items: { type: "string" },
        description: "Prompts for elements to scrape.",
      },
    },
    required: ["url", "element_prompts"],
  },
};


const tools = [AI_SCRAPER];

export default tools;