import { spawn } from "child_process";

// we must run the server first
const serverProc = spawn("node", ["dist/index.js"]);

const request = JSON.stringify({ // this is the request we want to send to the server
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "ai_scrape",
    arguments: {
      url: "https://jigsawstack.com/docs/api-reference/ai/scrape",
      element_prompts: ["title", "h1"]
    }
  },
  id: 1
});

//log the request being sent
console.log("Sending request:", request);

//listen to server's stdout
serverProc.stdout.on("data", (data) => {
  console.log("Server Response:", data.toString());
});

//send the request to the server:
serverProc.stdin.write(request + "\n");

//listen to server's stderr for errors if any
serverProc.stderr.on("data", (data) => {
  console.error("Server Error:", data.toString());
});
