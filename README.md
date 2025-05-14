[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/jigsawstack-jigsawstack-mcp-server-badge.png)](https://mseep.ai/app/jigsawstack-jigsawstack-mcp-server)

# JigsawStack MCP Server

## Introduction
JigsawStack MCP (Model Context Protocol) Server is a versatile platform designed to facilitate the integration and management of various tools. Each directory within the server represents a distinct tool that can be utilized for different purposes by an LLM. The server is built using Node.js and Express.js, and each tool is encapsulated within its own directory, making it easy to add, remove, or update tools without affecting the overall system.

Start by obtaining your JIGSAWSTACK_API_KEY from the our website. You will need this key to access the JigsawStack services. You can get your API key by signing up for a free account at [JigsawStacks](https://jigsawstack.com/dashboard).

## Installation

### Prerequisites
- Ensure you have `git` installed on your system.
- Ensure you have `node.js` and `npm` installed.
- Alternatively, you can use `yarn` instead of `npm`. as a package manager.

### Steps to Setup the repository:
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/jigsawstack-mcp-server.git
    ```
2. Navigate to the project directory:
    ```sh
    cd jigsawstack-mcp-server
    ```
3. Install the necessary dependencies:
    ```sh
    npm install or yarn install
    ```

## What is MCP?
MCP stands for Model Context Protocol. It is a framework that allows users to integrate LLMs and manage various tools and components exposing external data in a modular fashion. Here each tool is encapsulated within its own directory, making it easy to add, remove, or update tools without affecting the overall system.

## Using JigsawStack MCP Server
There are four tools available in the MCP Server. Each tool is contained within its own directory and has its own set of instructions for use.

### Running a tool
To run a tool,
1. cd into the tool directory and follow the instructions.
2. Export the JIGSAWSTACK_API_KEY environment variable with your JIGSAWSTACK API key.
    ```sh
    export JIGSAWSTACK_API_KEY=your_api_key
    ```
3. Start the server:
    ```sh
    npm start
    ```
4. Access the server through your web browser at `http://localhost:3000`.

### Directory Structure
- `/ai-web-scraper`: Let AI scrape the internet for you!
- `/ai-web-search`: Search powered by AI capable of handling complex queries.
- `/image-generation`: Generate images using prompts, to receive a base64 string of the image.

## Contact
For any questions or issues, please contact us at hello@jigsawstack.com.
