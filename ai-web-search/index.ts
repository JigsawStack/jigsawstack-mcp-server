
import { JigsawStack } from "jigsawstack";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";


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
const search = async (query: string, ai_overview: boolean | undefined, safe_search: "strict" | "moderate" | "off" | undefined , spell_check: boolean | undefined) => {

    // build a payload out of non empty parameters
    const payload: any = {};
    if (query) payload.query = query;
    if (ai_overview !== undefined) payload.ai_overview = ai_overview;
    if (safe_search) payload.safe_search = safe_search;
    if (spell_check !== undefined) payload.spell_check = spell_check;

    const result = await jigsawStackClient.web.search(payload);
    
    return JSON.stringify(result, null, 2);
}

// Define a server:
console.log("Creating McpServer");
const server = new McpServer({
    name: "ai-web-search",
    description: "Allow AI to do the browsing for you, a mcp tool powered by JigsawStack",
    version: "0.1.0"
  });

console.log("McpServer created, now defining tool");
// Define a tool:
server.tool(
    "search",
    { 
        query: z.string(), 
        ai_overview: z.boolean().optional(),
        safe_search: z.enum(["strict", "moderate", "off"]).optional(), 
        spell_check: z.boolean().optional() 
    },
    async ({ query, ai_overview, safe_search, spell_check }) => {
        const result = await search(query, ai_overview, safe_search, spell_check);
        return {
            content: [{ type: "text", text: result }]
        };
    }
);

console.log("Tool defined, now connecting to transport");

console.log("Enabling transport");
const transport = new StdioServerTransport();
await server.connect(transport);
console.log("Transport enabled, server is now running waiting for requests");



