#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Check for required API key
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

// Initialize Anthropic client
let anthropic;
try {
  anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });
  console.error('Anthropic client initialized successfully');
  console.error('Messages method available:', typeof anthropic.messages);
} catch (error) {
  console.error('Error initializing Anthropic client:', error);
  throw new Error('Failed to initialize Anthropic client: ' + error.message);
}

// Create an MCP server
const server = new McpServer({
  name: "people-info",
  version: "2.0.0",
  description: "Orchestrator MCP server that intelligently calls developer-info and designer-info servers based on queries"
});

// Store active MCP clients
const mcpClients = new Map();

// Function to start an MCP server and create a client connection
async function startMcpServerAndConnect(serverType) {
  const clientKey = `${serverType}-info`;
  
  // Return existing client if already connected
  if (mcpClients.has(clientKey)) {
    console.error(`${clientKey} client already exists, reusing connection`);
    return mcpClients.get(clientKey);
  }

  try {
    console.error(`Starting ${clientKey} MCP server and creating client connection`);
    
    // Determine the path to the server directory using absolute path
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const serverDir = path.resolve(currentDir, '..', `${serverType}-info-server`);
    console.error(`Current file directory: ${currentDir}`);
    console.error(`Server directory: ${serverDir}`);
    
    // Verify the directory exists
    try {
      const fs = await import('fs');
      if (!fs.existsSync(serverDir)) {
        throw new Error(`Server directory does not exist: ${serverDir}`);
      }
      if (!fs.existsSync(path.join(serverDir, 'index.js'))) {
        throw new Error(`index.js not found in: ${serverDir}`);
      }
      console.error(`Directory verification passed for ${serverDir}`);
    } catch (error) {
      console.error(`Directory verification failed:`, error);
      throw error;
    }
    
    // Create MCP client and connect to the server
    console.error(`Creating MCP client for ${clientKey}`);
    const indexPath = path.join(serverDir, 'index.js');
    console.error(`Full index.js path: ${indexPath}`);
    
    const transport = new StdioClientTransport({
      command: '/Users/banik/.nvm/versions/node/v22.16.0/bin/node',
      args: [indexPath],
      options: {
        stdio: ['pipe', 'pipe', 'pipe']
      }
    });
    
    const client = new Client({
      name: "people-info-client",
      version: "1.0.0"
    }, {
      capabilities: {}
    });
    
    // Connect the client
    await client.connect(transport);
    console.error(`${clientKey} MCP client connected successfully`);
    
    // Store the client and transport for cleanup
    mcpClients.set(clientKey, {
      client,
      transport
    });
    
    return mcpClients.get(clientKey);
    
  } catch (error) {
    console.error(`Error connecting to ${clientKey} server:`, error);
    throw error;
  }
}

// Function to call a tool on a connected MCP server
async function callMcpTool(serverType, toolName, args = {}) {
  try {
    console.error(`Calling ${toolName} on ${serverType}-info server`);
    
    // Get or create the MCP client connection
    const mcpConnection = await startMcpServerAndConnect(serverType);
    const { client } = mcpConnection;
    
    // Call the tool
    const result = await client.callTool({
      name: toolName,
      arguments: args
    });
    
    console.error(`${toolName} result:`, result);
    return result;
    
  } catch (error) {
    console.error(`Error calling ${toolName} on ${serverType}-info server:`, error);
    
    // Fallback to hardcoded values if MCP call fails
    console.error(`Falling back to hardcoded ${serverType} data`);
    if (serverType === 'developer' && toolName === 'get_developer_name') {
      return {
        content: [
          {
            type: "text",
            text: "Neick (fallback)",
          },
        ],
      };
    } else if (serverType === 'designer' && toolName === 'get_designer_name') {
      return {
        content: [
          {
            type: "text",
            text: "Jesse (fallback)",
          },
        ],
      };
    }
    throw error;
  }
}

// Function to analyze user query using Claude
async function analyzeUserQuery(query) {
  try {
    console.error("Analyzing user query with Claude");
    
    const analysisSystemPrompt = `You are an assistant that analyzes user queries about people information.
Your task is to determine what type of information the user is asking for and which server should handle it.

Analyze the query and respond with a JSON object containing:
- "category": "DEVELOPER" if asking about developers/programming, "DESIGNER" if asking about designers/design, "OTHER" if neither
- "action": "GET_NAME" if asking for a name, "GET_INFO" if asking for general information, "OTHER" for other requests
- "reasoning": Brief explanation of your analysis

Examples:
- "What is the name of the developer?" -> {"category": "DEVELOPER", "action": "GET_NAME", "reasoning": "User wants developer name"}
- "Tell me about the designer" -> {"category": "DESIGNER", "action": "GET_INFO", "reasoning": "User wants designer information"}
- "Who is the frontend developer?" -> {"category": "DEVELOPER", "action": "GET_NAME", "reasoning": "User wants developer name"}`;

    const analysisUserMessage = `Analyze this query: "${query}"`;

    const analysisMessage = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 200,
      system: analysisSystemPrompt,
      messages: [
        { role: "user", content: analysisUserMessage }
      ]
    });

    const analysisText = analysisMessage.content[0].text.trim();
    console.error(`Claude analysis: ${analysisText}`);
    
    // Parse the JSON response
    const analysis = JSON.parse(analysisText);
    return analysis;
    
  } catch (error) {
    console.error("Error analyzing user query:", error);
    // Fallback analysis
    const queryLower = query.toLowerCase();
    if (queryLower.includes('develop') || queryLower.includes('program') || queryLower.includes('engineer')) {
      return { category: "DEVELOPER", action: "GET_INFO", reasoning: "Fallback: detected developer keywords" };
    } else if (queryLower.includes('design') || queryLower.includes('ui') || queryLower.includes('ux')) {
      return { category: "DESIGNER", action: "GET_INFO", reasoning: "Fallback: detected designer keywords" };
    }
    return { category: "OTHER", action: "OTHER", reasoning: "Fallback: no specific category detected" };
  }
}

// Function to generate enhanced response using Claude
async function generateEnhancedResponse(originalQuery, mcpResult, analysis) {
  try {
    console.error("Generating enhanced response with Claude");
    
    const systemPrompt = `You are an assistant that provides enhanced responses about people information.
You received data from an MCP server and need to present it in a natural, conversational way that directly answers the user's question.

The user asked: "${originalQuery}"
The analysis determined: ${analysis.reasoning}
The MCP server returned: ${JSON.stringify(mcpResult)}

Provide a natural, helpful response that directly answers the user's question using the MCP data.`;

    const userMessage = `Please provide a natural response to the user's query using the MCP server data.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        { role: "user", content: userMessage }
      ]
    });

    return message.content[0].text;
    
  } catch (error) {
    console.error("Error generating enhanced response:", error);
    // Fallback to raw MCP result
    if (mcpResult.content && mcpResult.content[0] && mcpResult.content[0].text) {
      return mcpResult.content[0].text;
    }
    return "I received information from the server but couldn't format it properly.";
  }
}

// Add the main orchestrator tool
server.tool(
  "get_people_info",
  {
    query: z.string().describe("Natural language query about people information (e.g., 'What is the developer's name?', 'Tell me about the designer')"),
  },
  async ({ query }) => {
    try {
      console.error(`People Info MCP: get_people_info called with query: ${query}`);
      
      // Step 1: Analyze the user query
      console.error("Step 1: Analyzing user query with Claude");
      const analysis = await analyzeUserQuery(query);
      console.error(`Analysis result:`, analysis);
      
      let mcpResult;
      
      // Step 2: Call appropriate MCP server based on analysis
      if (analysis.category === "DEVELOPER") {
        console.error("Step 2: Calling REAL developer-info MCP server");
        mcpResult = await callMcpTool('developer', 'get_developer_name');
      } else if (analysis.category === "DESIGNER") {
        console.error("Step 2: Calling REAL designer-info MCP server");
        mcpResult = await callMcpTool('designer', 'get_designer_name');
      } else {
        console.error("Step 2: Query not related to developer or designer");
        return {
          content: [
            {
              type: "text",
              text: `I can help you with information about developers and designers. Your query "${query}" doesn't seem to be asking about either. Try asking something like "What is the developer's name?" or "Tell me about the designer".`,
            },
          ],
        };
      }
      
      // Step 3: Generate enhanced response using Claude
      console.error("Step 3: Generating enhanced response");
      const enhancedResponse = await generateEnhancedResponse(query, mcpResult, analysis);
      
      return {
        content: [
          {
            type: "text",
            text: enhancedResponse,
          },
        ],
      };
      
    } catch (error) {
      console.error("Error in get_people_info:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error processing your request: ${error.message}. Please try asking about developer or designer information.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Cleanup function to close all MCP connections
process.on('SIGINT', async () => {
  console.error('Shutting down people-info server...');
  
  for (const [key, connection] of mcpClients.entries()) {
    try {
      console.error(`Closing connection to ${key}`);
      if (connection.client) {
        await connection.client.close();
      }
    } catch (error) {
      console.error(`Error closing ${key}:`, error);
    }
  }
  
  process.exit(0);
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('People Info MCP Orchestrator v2.0 running on stdio - WITH REAL MCP COMMUNICATION');