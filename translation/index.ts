import { JigsawStack } from "jigsawstack";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
    McpError,
    ErrorCode,
    TextContent
} from "@modelcontextprotocol/sdk/types.js";

const TRANSLATION: Tool = {
        name: "translation",
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

console.log("Creating a new instance of Server.");
const server: Server = new Server(
    {
        name: "translation",  
        version: "0.1.0",          
    },
    {
        capabilities: {
          tools: {
            translation: TRANSLATION
          },
        },
    }
);

const JIGSAWSTACK_API_KEY = process.env.JIGSAWSTACK_API_KEY;

console.log("Checking for JIGSAWSTACK_API_KEY");

if (!JIGSAWSTACK_API_KEY) {
  throw new Error("JIGSAWSTACK_API_KEY environment variable is required");
}

console.log("Creating JigsawStack client");
// Create a new JigsawStack client //
const jigsawStackClient = JigsawStack({
  apiKey: JIGSAWSTACK_API_KEY,
});

console.log("JigsawStack client created");


const translate = async (text: string, target_language: string): Promise<string> => {
    const payload = {
        text: text,
        target_language: target_language,
    };
    const result = await jigsawStackClient.translate(payload);
    return JSON.stringify(result, null, 2);
};

console.log("Setting up server request handler, to return the tools");
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [TRANSLATION],
}));


console.log("Setting up server request handler, to handle the request");
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "translation":
            const { text, target_language } = request.params.arguments as {
                text: string;
                target_language: string;
            };
            try {
                const result = await translate(text, target_language);
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
console.log("We gucci, lesgoooo!");




