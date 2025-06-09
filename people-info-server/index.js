#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import axios from "axios";

// Load environment variables
dotenv.config();

// Check for required API key
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

// Create an MCP server
const server = new McpServer({
  name: "people-info-server",
  version: "1.0.0"
});

// Function to call the get_developer_name tool
async function callDeveloperNameTool() {
  try {
    // This would typically be a call to the actual MCP tool
    // For demonstration, we're using axios to call a local endpoint
    // In a real implementation, you would use the appropriate MCP client
    // or have a more direct way to call the other MCP server
    
    // For simplicity in this example, we'll just return the known value
    // In a real implementation, you would make an actual call to the other MCP server
    return "Neick";
  } catch (error) {
    console.error("Error calling get_developer_name tool:", error);
    throw error;
  }
}

// Add a tool for getting people info based on title
server.tool(
  "get_people_info",
  {
    title: z.string().describe("Job title to get information about"),
  },
  async ({ title }) => {
    try {
      // Prepare the system prompt for Claude
      const systemPrompt = `You are an assistant that helps provide information about people with specific job titles.
You have access to a tool called get_developer_name that returns the name of the developer.
When asked about developers or programmers, you should use this tool to get accurate information.`;

      // Prepare the user message
      const userMessage = `I need information about a person with the title: ${title}. 
If this is a developer or programmer role, please use the get_developer_name tool to find out their name.
Otherwise, just provide general information about what people with this title typically do.`;

      // Call Claude with the ability to use tools
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: "user", content: userMessage }
        ],
        tools: [
          {
            name: "get_developer_name",
            description: "Get the name of the developer",
            input_schema: {
              type: "object",
              properties: {},
              required: []
            }
          }
        ]
      });

      // Process the response
      let finalResponse = "";
      
      // Check if Claude used the tool
      if (message.content[0].type === "tool_use") {
        // Claude wants to use the tool
        const toolUse = message.content[0];
        
        if (toolUse.name === "get_developer_name") {
          // Call the actual tool
          const developerName = await callDeveloperNameTool();
          
          // Create a tool response
          const toolResponse = {
            role: "tool",
            content: developerName,
            name: "get_developer_name"
          };
          
          // Call Claude again with the tool response
          const finalMessage = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1000,
            system: systemPrompt,
            messages: [
              { role: "user", content: userMessage },
              toolUse,
              toolResponse
            ]
          });
          
          // Get the final response
          finalResponse = finalMessage.content[0].text;
        }
      } else {
        // Claude didn't use the tool
        finalResponse = message.content[0].text;
      }

      return {
        content: [
          {
            type: "text",
            text: finalResponse,
          },
        ],
      };
    } catch (error) {
      console.error("Error in get_people_info:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('People Info MCP server running on stdio');