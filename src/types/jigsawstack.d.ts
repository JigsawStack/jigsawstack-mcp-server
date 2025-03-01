declare module 'jigsawstack' {
  export function JigsawStack(config: { apiKey: string }): {
    web: {
      ai_scrape(payload: { url: string; element_prompts: string[] }): Promise<any>;
    };
  };
}
