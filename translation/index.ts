import { JigsawStack } from "jigsawstack";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool, McpError, ErrorCode, TextContent } from "@modelcontextprotocol/sdk/types.js";

const TEXT_TRANSLATION: Tool = {
  name: "text-translation",
  description: "Translate text quickly and easily with JigsawStack, we support over 180+ language pairs.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Text in current langauge." },
      target_language: { type: "string", description: "Current Langauge code in en | es | jp format." },
    },
    required: ["text", "target_language"],
  },
};

const IMAGE_TRANSLATION: Tool = {
  name: "image-translation",
  description: "Translate images quickly and easily with JigsawStack, we support over 180+ language pairs.",
  inputSchema: {
    type: "object",
    properties: {
      image: { type: "string", description: "Image URL or base64Encoded Image that has to be translated" },
      target_language: { type: "string", description: "Current Langauge code in en | es | jp format." },
    },
    required: ["imageBase64", "target_language"],
  },
};

const server: Server = new Server(
  {
    name: "translation",
    version: "0.1.1",
  },
  {
    capabilities: {
      tools: {
        text_translation: TEXT_TRANSLATION,
        image_translation: IMAGE_TRANSLATION,
      },
    },
  }
);

const JIGSAWSTACK_API_KEY = process.env.JIGSAWSTACK_API_KEY;

if (!JIGSAWSTACK_API_KEY) {
  throw new Error("JIGSAWSTACK_API_KEY environment variable is required");
}

// Create a new JigsawStack client //
const jigsawStackClient = JigsawStack({
  apiKey: JIGSAWSTACK_API_KEY,
});

const translate_text = async (text: string, target_language: string): Promise<string> => {
  const payload = {
    text: text,
    target_language: target_language,
  };
  const result = await jigsawStackClient.translate.text(payload);
  return JSON.stringify(result, null, 2);
};

async function base64ToBlob(base64Data: string): Promise<Blob> {
  const contentType = "image/jpeg"; // Or your desired content type
  const buffer = Buffer.from(base64Data, "base64");
  return new Blob([buffer], { type: contentType });
}

const isValidBase64 = (str: string): boolean => {
  //clean whitespace from the string.
  const cleaned = str.trim();
  //also ensure the length is a multiple of 4.
  return /^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length % 4 === 0;
};

const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const translate_image = async (input: string, target_language: string): Promise<string> => {
  //first upload the image to JigsawStack
  const imageUrlOrBase64 = input.startsWith("data:") ? input.split(",")[1] : input;
  if (!isValidBase64(imageUrlOrBase64) && !isValidURL(imageUrlOrBase64)) {
    throw new Error("Invalid image data: must be a valid base64 string or URL");
  }
  let result;
  if (isValidURL(imageUrlOrBase64)) {
    result = await jigsawStackClient.translate.image({
      url: imageUrlOrBase64,
      target_language: target_language,
    });
  } else {
    // If it's a URL, fetch the image and convert it to Blob
    const imageBlob = await base64ToBlob(imageUrlOrBase64);

    result = await jigsawStackClient.translate.image(imageBlob, {
      target_language: target_language,
    });
  }

  const translatedImageBuffer = await result.buffer();

  const resultImageURL = await jigsawStackClient.store.upload(translatedImageBuffer, {
    temp_public_url: true,
  });

  if (!resultImageURL.temp_public_url) {
    throw new Error("Failed to upload translated image to JigsawStack");
  }
  return resultImageURL.temp_public_url;
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [TEXT_TRANSLATION, IMAGE_TRANSLATION],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "text-translation":
      const { text, target_language } = request.params.arguments as {
        text: string;
        target_language: string;
      };
      try {
        const result = await translate_text(text, target_language);
        return { content: [{ type: "text", text: result }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to perform translation: ${(error as Error).message}` }], isError: true };
      }

    case "image-translation":
      const { image, target_language: targetLanguage } = request.params.arguments as {
        image: string;
        target_language: string;
      };
      try {
        const result = await translate_image(image, targetLanguage);
        return { content: [{ type: "text", text: result }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Failed to perform translation: ${(error as Error).message}` }], isError: true };
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
