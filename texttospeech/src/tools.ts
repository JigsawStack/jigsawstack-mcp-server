import { Tool } from "@modelcontextprotocol/sdk/types.js";




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


const tools = [TEXT_TO_SPEECH];

export default tools;