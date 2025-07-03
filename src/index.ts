import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import tools from "./tools.js";
import jigsawStackClient from "./lib/index.js";

const server: Server = new Server(
  {
    name: "JigsawStack",
    version: "0.1.1",
    description: "JigsawStack MCP Server",
  },
  {
    capabilities: {
      tools: {
        ...tools,
      },
    },
  }
);



const analyze = async (
  text: string,
): Promise<string> => {
  const payload: any = {};
  if (text) payload.text = text;

  const result = await jigsawStackClient.sentiment(payload);
  return JSON.stringify(result, null, 2);
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "sentiment": {
      const { text } = request.params.arguments as {
        text: string;
      };
      try {
        const result = await analyze(text);
        return { content: [{ type: "text", text: result }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to perform analysis: ${(error as Error).message}` }], isError: true };
      }
    }
    case "embeddings": {
      const { text } = request.params.arguments as {
        text: string;
      };
      try {
        const result = await jigsawStackClient.embedding({
          text,
          type: "text",
          token_overflow_mode: "truncate",
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to generate embeddings: ${(error as Error).message}` }], isError: true };
      }
    }
    case "image-generation": {
      try {
        const {
          prompt,
          aspect_ratio,
          width,
          height,
          steps,
          output_format,
          return_type,
          advance_config,
          url,
          file_store_key,
        } = request.params.arguments as {
          prompt: string;
          aspect_ratio?: string;
          width?: number;
          height?: number;
          steps?: number;
          output_format?: "png" | "svg";
          return_type?: "url" | "binary" | "base64";
          advance_config?: {
            negative_prompt?: string;
            guidance?: number;
            seed?: number;
          };
          url?: string;
          file_store_key?: string;
        };

        ["steps", "width", "height"].forEach((field) => {
          const value = (request.params.arguments as any)[field];
          if (value !== undefined && isNaN(Number(value))) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid ${field} value: ${value}`);
          }
        });
        if (advance_config) {
          ["guidance", "seed"].forEach((field) => {
            const value = (advance_config as any)[field];
            if (value !== undefined && isNaN(Number(value))) {
              throw new McpError(ErrorCode.InvalidParams, `Invalid advance_config.${field} value: ${value}`);
            }
          });
        }

        const result = await jigsawStackClient.image_generation({
          prompt,
          aspect_ratio: aspect_ratio as (
            | "1:1" | "16:9" | "21:9" | "3:2" | "2:3" | "4:5" | "5:4" | "3:4" | "4:3" | "9:16" | "9:21"
            | undefined
          ),
          width: width !== undefined ? Number(width) : undefined,
          height: height !== undefined ? Number(height) : undefined,
          steps: steps !== undefined ? Number(steps) : undefined,
          output_format,
          return_type: return_type || "url",
          advance_config: advance_config
            ? {
                negative_prompt: advance_config.negative_prompt,
                guidance:
                  advance_config.guidance !== undefined
                    ? Number(advance_config.guidance)
                    : undefined,
                seed:
                  advance_config.seed !== undefined
                    ? Number(advance_config.seed)
                    : undefined,
              }
            : undefined,
          url,
          file_store_key,
        });

        const content = [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ];
        return { content };
      } catch (error: any) {
        console.error("Error processing IMAGE_GENERATION request:", error);
        const content = [
          {
            type: "text",
            text: error.message,
          },
        ];
        return { content };
      }
    }
    case "speech-to-text": {
      const {
        url,
        file_store_key,
        language,
        translate,
        by_speaker,
        webhook_url,
        batch_size,
        chunk_duration,
      } = request.params.arguments as {
        url?: string;
        file_store_key?: string;
        language?: string;
        translate?: boolean;
        by_speaker?: boolean;
        webhook_url?: string;
        batch_size?: number;
        chunk_duration?: number;
      };
      try {
        const result = await jigsawStackClient.audio.speech_to_text({
          url,
          file_store_key,
          language,
          translate,
          by_speaker,
          webhook_url,
          batch_size,
          chunk_duration,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to convert speech to text: ${(error as Error).message}` }], isError: true };
      }
    }
    case "text-to-speech": {
      const { text, accent, voice_clone_id } = request.params.arguments as {
        text: string;
        accent?: string;
        voice_clone_id?: string;
      };
      try {
        const result = await jigsawStackClient.audio.text_to_speech({ text, accent: accent as any, voice_clone_id, return_type: "url" });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to convert text to speech: ${(error as Error).message}` }], isError: true };
      }
    }
    case "translate": {
      const { text, target_language } = request.params.arguments as {
        text: string;
        target_language:   string;
      };
      try {
        const result = await jigsawStackClient.translate.text({ text, target_language: target_language as any });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to translate text: ${(error as Error).message}` }], isError: true };
      }
    }
    case "object-detection": {
      const { url, file_store_key, prompts, features, annotated_image } = request.params.arguments as {
        url?: string;
        file_store_key?: string;
        prompts?: string[];
        features?: ("object_detection" | "gui")[];
        annotated_image?: boolean;
      };
      try {
        const result = await jigsawStackClient.vision.object_detection({ url, file_store_key, prompts, features, annotated_image, return_type: "url" });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to detect objects: ${(error as Error).message}` }], isError: true };
      }
    }
    case "vocr":{
      const { prompt, url, file_store_key, page_range } = request.params.arguments as {
        prompt: string | string[];
        url?: string;
        file_store_key?: string;
        page_range?: number[];
      };    
      try {
        const result = await jigsawStackClient.vision.vocr({
          prompt,
          url,
          file_store_key,
          page_range,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to extract text: ${(error as Error).message}` }], isError: true };
      } 
    }
    case "nsfw":{
      const { url, file_store_key } = request.params.arguments as {
        url?: string;
        file_store_key?: string;
      };
      try {
        const result = await jigsawStackClient.validate.nsfw({ url, file_store_key });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to validate NSFW: ${(error as Error).message}` }], isError: true };
      }
    }

    case "ai-scraper":{
      const {
        url,
        root_element_selector,
        page_position,
        http_headers,
        reject_request_pattern,
        goto_options,
        wait_for,
        advance_config,
        size_preset,
        is_mobile,
        scale,
        width,
        height,
        cookies,
        force_rotate_proxy,
        byo_proxy,
        selectors,
        element_prompts,
      } = request.params.arguments as {
        url: string;
        root_element_selector?: string;
        page_position?: number;
        http_headers?: object;
        reject_request_pattern?: string[];
        goto_options?: { timeout: number; wait_until: string };
        wait_for?: { mode: string; value: string | number };
        advance_config?: { console: boolean; network: boolean; cookies: boolean };
        size_preset?: string;
        is_mobile?: boolean;
        scale?: number;
        width?: number;
        height?: number;
        cookies?: object[];
        force_rotate_proxy?: boolean;
        byo_proxy?: { server: string; auth?: { username: string; password: string } };
        selectors?: string[];
        element_prompts?: string[];
      };
      try {
        const result = await jigsawStackClient.web.ai_scrape({
          url,
          root_element_selector,
          page_position,
          http_headers,
          reject_request_pattern,
          goto_options,
          wait_for,
          advance_config,
          size_preset,
          is_mobile,
          scale,
          width,
          height,
          force_rotate_proxy,
          byo_proxy,
          selectors,
          element_prompts: element_prompts ?? [],
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to scrape website: ${(error as Error).message}` }], isError: true };
      }
    }
    case "web-search":{
      const { query , spell_check, safe_search, ai_overview, byo_urls, country_code, auto_scrape } = request.params.arguments as {
        query: string;
        spell_check?: boolean;
        safe_search?: "strict" | "moderate" | "off";
        ai_overview?: boolean;
        byo_urls?: string[];
        country_code?: string;
        auto_scrape?: boolean;
      };
      try {
        const result = await jigsawStackClient.web.search({ query, spell_check, safe_search, ai_overview, byo_urls, country_code, auto_scrape });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to search the web: ${(error as Error).message}` }], isError: true };
      }
    }
    case "deep-research":{
      const { query, spell_check, safe_search, ai_overview, byo_urls, country_code, auto_scrape, deep_research_config } = request.params.arguments as {
        query: string;
        spell_check?: boolean;
        safe_search?: "strict" | "moderate" | "off";
        ai_overview?: boolean;
        byo_urls?: string[];    
        country_code?: string;
        auto_scrape?: boolean;
        deep_research_config?: {
          max_depth?: number;
          max_breadth?: number;
          max_output_tokens?: number;   
          target_output_tokens?: number;
        };
      };
      try {
        const result = await jigsawStackClient.web.search({ query, spell_check, safe_search, ai_overview, byo_urls, country_code, auto_scrape, deep_research:true, deep_research_config });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };  
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to perform deep research: ${(error as Error).message}` }], isError: true };
      }
    } 
      default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
