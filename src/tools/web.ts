import { z } from 'zod';
import { JigsawStack } from 'jigsawstack';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { config } from 'dotenv';

config();

/**
 Register web-related tools on the given MCP server.
 * @param {McpServer} server - The MCP server instance to register tools on.
 */
async function registerWebTools(server: McpServer) {
  const aiScrapeSchema = { //defining the zo schema for the jigsawstack.ai_scrape tool.
    url: z.string().url(),
    // element_prompts should be comma-separated strings, e.g. "title,h1" which will be converted to an array of strings.
    element_prompts: z.array(z.string()),
  };
  console.log('Defining schema for ai_scrape tool:', aiScrapeSchema);

  try {
    server.tool(
      'ai_scrape',
      aiScrapeSchema,
      /** 
       * Tool implementation: Scrape a webpage and return content.
       * @param {Object} args - Parsed arguments, e.g. { url, format }.
       */
      async (args: { url: string; element_prompts: string[] }) => {
        console.log('Executing ai_scrape with args:', args);
        
        if (args.element_prompts == undefined){
          throw new Error('parameter \'element_prompts\' is required'); //check if the element_prompts parameter is defined.
        }

        const { url, element_prompts } = args;
        const jigsawStackClient = JigsawStack({ apiKey: process.env.JIGSAWSTACK_API_KEY });
        const payload = { url, element_prompts: element_prompts };
        const content = await jigsawStackClient.web.ai_scrape(payload);

        if (!content) {
          throw new Error(`Failed to scrape content from ${url}`);
        }

        const contentString = JSON.stringify(content);
        const response = `The content of scraped from ${url} with prompts ${element_prompts} is: ${contentString}`;

        return { content: [{ type: 'text', text: response }] };
      }
    );
    console.log("Tool 'ai_scrape' registered successfully.");
  } catch (err) {
    console.error("Error registering tool 'ai_scrape':", err);
  }
}

export { registerWebTools };

// Manually define the types for the process object
declare const process: {
  env: {
    JIGSAWSTACK_API_KEY: string;
  };
};
