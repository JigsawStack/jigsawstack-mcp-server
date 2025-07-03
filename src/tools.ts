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

const SPEECH_TO_TEXT: Tool = {
  name: "speech-to-text",
  description: "Convert speech to text",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL for the audio input." },
      file_store_key: { type: "string", description: "Optional file store key." },
      language: { type: "string", description: "Language of the audio." },
      translate: { type: "boolean", description: "Whether to translate the recognized text." },
      by_speaker: { type: "boolean", description: "Whether to separate text by speaker." },
      webhook_url: { type: "string", description: "Webhook URL for asynchronous results." },
      batch_size: { type: "number", description: "Batch size for processing." },
      chunk_duration: { type: "number", description: "Duration of each audio chunk in seconds." },
    },
  },
};


const TEXT_TO_SPEECH: Tool = {
  name: "text-to-speech",
  description: "Convert text to speech",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "The text to convert to speech." },
      accent: { type: "string", description: "Accent for the speech (SupportedAccents)." },
      voice_clone_id: { type: "string", description: "Voice clone ID to use for speech synthesis." },
    },
    required: ["text"],
  },
};

const TRANSLATE: Tool = {
  name: "translate",
  description: "Translate text to a different language",
  inputSchema: {
    type: "object",
  },
  properties: {
    text: { type: "string", description: "The text to translate." },
    target_language: { type: "string", description: "The target language to translate to." },
  },
  required: ["text", "target_language"],
  };

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

const tools = [SENTIMENT, EMBEDDINGS, IMAGE_GENERATION, SPEECH_TO_TEXT, TEXT_TO_SPEECH, TRANSLATE, OBJECT_DETECTION, VOCR, NSFW, AI_SCRAPER, WEB_SEARCH, DEEP_RESEARCH];

export default tools;