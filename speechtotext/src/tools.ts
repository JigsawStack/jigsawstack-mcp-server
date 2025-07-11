import { Tool } from "@modelcontextprotocol/sdk/types.js";

const SPEECH_TO_TEXT: Tool = {
  name: "speech-to-text",
  description: "Convert speech to text, powered by JigsawStack",
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


const tools = [SPEECH_TO_TEXT];

export default tools; 