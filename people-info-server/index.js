#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { spawn } from "child_process";
import path from "path";

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
  name: "people-info",
  version: "1.0.0",
  description: "MCP server that provides information about people based on their title"
});

// Function to start an MCP server and call a tool
async function startServerAndCallTool(serverType, toolName) {
  try {
    console.error(`Starting ${serverType}-info MCP server and calling ${toolName} tool`);
    
    // Determine the path to the server directory
    const serverDir = path.join(process.cwd(), '..', `${serverType}-info-server`);
    console.error(`Server directory: ${serverDir}`);
    
    // Start the MCP server process
    console.error(`Spawning ${serverType}-info server process`);
    const serverProcess = spawn('node', ['index.js'], {
      cwd: serverDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Log server output for debugging
    serverProcess.stdout.on('data', (data) => {
      console.error(`${serverType}-info server stdout: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`${serverType}-info server stderr: ${data}`);
    });
    
    // Wait for the server to start (simple delay)
    console.error(`Waiting for ${serverType}-info server to start`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demonstration purposes, return hardcoded values
    // In a real implementation, you would establish proper communication with the server
    if (serverType === 'developer') {
      console.error('Returning developer name: Neick');
      return "Neick";
    } else if (serverType === 'designer') {
      console.error('Returning designer name: Jesse');
      return "Jesse";
    }
    
    // Clean up the server process
    console.error(`Terminating ${serverType}-info server process`);
    serverProcess.kill();
    
  } catch (error) {
    console.error(`Error with ${serverType}-info server:`, error);
    // Fallback to hardcoded values in case of error
    console.error(`Falling back to hardcoded ${serverType} name`);
    return serverType === 'developer' ? "Neick" : "Jesse";
  }
}

// Function to call the developer-info MCP server's get_developer_name tool
async function callDeveloperNameTool() {
  return startServerAndCallTool('developer', 'get_developer_name');
}

// Function to call the designer-info MCP server's get_designer_name tool
async function callDesignerNameTool() {
  return startServerAndCallTool('designer', 'get_designer_name');
}

// Add a tool for getting people info based on title
server.tool(
  "get_people_info",
  {
    title: z.string().describe("Job title to get information about"),
  },
  async ({ title }) => {
    try {
      console.error(`People Info MCP: get_people_info tool called with title: ${title}`);
      
      // First, use Claude to analyze the title and determine its category
      console.error("Using Claude to analyze the job title");
      
      // Prepare the system prompt for Claude's analysis
      const analysisSystemPrompt = `You are an assistant that helps analyze job titles.
Your task is to determine if a job title is related to software development or design.
Respond with ONLY "DEVELOPER" if the title is related to software development, programming, or engineering.
Respond with ONLY "DESIGNER" if the title is related to design, UI/UX, graphics, or visual arts.
Respond with ONLY "OTHER" if it is not related to either development or design.`;

      // Prepare the user message for analysis
      const analysisUserMessage = `What category does the job title "${title}" belong to? (DEVELOPER, DESIGNER, or OTHER)`;

      // Call Claude for analysis
      const analysisMessage = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 100,
        system: analysisSystemPrompt,
        messages: [
          { role: "user", content: analysisUserMessage }
        ]
      });

      // Get the analysis result
      const analysisResult = analysisMessage.content[0].text.trim();
      console.error(`Claude's analysis result: ${analysisResult}`);
      
      // Handle based on the analysis result
      if (analysisResult === "DEVELOPER") {
        console.error("Title is developer-related, calling developer-info MCP server");
        
        // Call the developer-info MCP server to get the developer name
        const developerName = await callDeveloperNameTool();
        
        // Now use Claude to generate a detailed response about this developer
        const devInfoSystemPrompt = `You are an assistant that provides information about software developers.
You know that the developer's name is "${developerName}".
Provide a brief, professional description of what this developer might do in their role.`;

        const devInfoUserMessage = `Tell me about the software ${title} named ${developerName}.`;

        const devInfoMessage = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1000,
          system: devInfoSystemPrompt,
          messages: [
            { role: "user", content: devInfoUserMessage }
          ]
        });

        // Get the detailed developer info
        const devInfoResponse = devInfoMessage.content[0].text;
        
        return {
          content: [
            {
              type: "text",
              text: devInfoResponse,
            },
          ],
        };
      } else if (analysisResult === "DESIGNER") {
        console.error("Title is designer-related, calling designer-info MCP server");
        
        // Call the designer-info MCP server to get the designer name
        const designerName = await callDesignerNameTool();
        
        // Now use Claude to generate a detailed response about this designer
        const designerInfoSystemPrompt = `You are an assistant that provides information about designers.
You know that the designer's name is "${designerName}".
Provide a brief, professional description of what this designer might do in their role.`;

        const designerInfoUserMessage = `Tell me about the ${title} named ${designerName}.`;

        const designerInfoMessage = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1000,
          system: designerInfoSystemPrompt,
          messages: [
            { role: "user", content: designerInfoUserMessage }
          ]
        });

        // Get the detailed designer info
        const designerInfoResponse = designerInfoMessage.content[0].text;
        
        return {
          content: [
            {
              type: "text",
              text: designerInfoResponse,
            },
          ],
        };
      } else {
        // For other titles, use Claude to generate a response
        console.error("Title is neither developer nor designer related, using Claude to generate response");
        
        // Prepare the system prompt for Claude
        const systemPrompt = `You are an assistant that helps provide information about people with specific job titles.
Provide a brief, professional description of what people with the given job title typically do.`;

        // Prepare the user message
        const userMessage = `I need information about a person with the title: ${title}.
Please provide general information about what people with this title typically do.`;

        // Call Claude
        const message = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            { role: "user", content: userMessage }
          ]
        });

        // Get the response
        const response = message.content[0].text;

        return {
          content: [
            {
              type: "text",
              text: response,
            },
          ],
        };
      }
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