#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "developer-info",
  version: "1.0.0",
  description: "MCP server that provides developer information"
});

// Add a tool for getting the developer name
server.tool(
  "get_developer_name",
  {
    // No parameters needed for this simple tool
  },
  async () => {
    console.error("Developer Info MCP: get_developer_name tool called");
    // Return "Neick" as the developer name
    return {
      content: [
        {
          type: "text",
          text: "Neick",
        },
      ],
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Developer Info MCP server running on stdio');