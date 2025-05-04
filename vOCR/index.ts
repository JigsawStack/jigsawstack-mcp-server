import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { JigsawStack } from "jigsawstack";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool, McpError, ErrorCode, TextContent } from "@modelcontextprotocol/sdk/types.js";

const JIGSAWSTACK_API_KEY = process.env.JIGSAWSTACK_API_KEY;

const jigsawStackClient = JigsawStack({
  apiKey: JIGSAWSTACK_API_KEY,
});

const vocr = async (
  prompts: string[],
  key: string //get the filekey from the store.upload which can be used with vOCR: https://jigsawstack.com/docs/examples/file-upload
) => {
  const result = await jigsawStackClient.vision.vocr({
    prompt: prompts,
    file_store_key: key,
  });
  return result;
};

const getImageBuffer = (base64Image: string): Buffer => {
  //remove the header (if present)
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  //convert base64 to a Buffer
  return Buffer.from(base64Data, "base64");
};

const VOCR: Tool = {
  name: "VOCR",
  description: "Let AI read your images. Powered by our OCR engine by JigsawStack.",
  inputSchema: {
    type: "object",
    properties: {
      base64Image: {
        type: "string",
        description: "A Base64 encoded string of the image.",
      },
      prompts: {
        type: "array",
        items: { type: "string" },
        description: "Prompts to help the AI understand the context of the image.",
      },
    },
    required: ["base64Image"],
  },
};

const server: Server = new Server(
  {
    name: "vOCR",
    version: "0.1.1",
  },
  {
    capabilities: {
      tools: {
        VOCR: VOCR,
      },
    },
  }
);

const isValidBase64 = (str: string): boolean => {
  //cean whitespace from the string.
  const cleaned = str.trim();
  //a simple regex check: Base64 strings consist of A-Z, a-z, 0-9, +, / with optional '=' padding.
  //also ensure the length is a multiple of 4.
  return /^[A-Za-z0-9+/]+={0,2}$/.test(cleaned) && cleaned.length % 4 === 0;
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [VOCR],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "VOCR": {
      try {
        const { base64Image } = request.params.arguments as {
          base64Image: string;
        };
        const { prompts } = request.params.arguments as { prompts: string[] };

        if (!isValidBase64(base64Image)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid base64 image string provided.");
        }

        //get the buffer from the base64 image.
        const imageFile = getImageBuffer(base64Image);

        const result = await jigsawStackClient.store.upload(imageFile, {
          overwrite: true,
        });

        const response = await vocr(prompts, result.key);
        const content = [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ];
        return { content };
      } catch (error: any) {
        const content = [
          {
            type: "text",
            text: error.message,
          },
        ];
        return { content };
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
