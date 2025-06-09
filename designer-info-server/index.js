#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "designer-info",
  version: "1.0.0",
  description: "MCP server that provides designer information"
});

// Add a tool for getting the designer name
server.tool(
  "get_designer_name",
  {
    // No parameters needed for this simple tool
  },
  async () => {
    console.error("Designer Info MCP: get_designer_name tool called");
    // Return "Jesse" as the designer name
    return {
      content: [
        {
          type: "text",
          text: "Jesse",
        },
      ],
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Designer Info MCP server running on stdio');