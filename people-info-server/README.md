# People Info MCP Server

An MCP server that provides a `get_people_info` tool that returns information about people with specific job titles. It uses Claude to analyze job titles and, when appropriate, calls the `get_developer_name` tool from the developer-info MCP server.

## Architecture

This server demonstrates an intelligent hybrid architecture combining LLM analysis and direct MCP tool calling:

1. Claude calls the `get_people_info` tool provided by this server
2. This server uses Claude to analyze the job title and determine if it's developer-related
3. For developer-related titles:
   - The server calls the `get_developer_name` tool from the developer-info server
   - Then uses Claude to generate detailed information about the developer
4. For other titles, this server uses Claude to generate information about the job
5. The result flows back to the original Claude

## Prerequisites

- Node.js and npm
- Docker
- Anthropic API key

## Setup

1. Copy the `.env.template` file to `.env` and add your Anthropic API key:

```bash
cp .env.template .env
# Edit the .env file to add your Anthropic API key
```

2. Install dependencies:

```bash
npm install
```

3. Make the index.js file executable:

```bash
chmod +x index.js
```

## Building and Running

### Build the Docker Image

```bash
docker build -t mcp-people-info-server .
```

### Run the Docker Container

```bash
docker run -i --env-file .env mcp-people-info-server
```

Note: The `-i` flag is important as it keeps stdin open, which is required for stdio communication.

## MCP Server Configuration

To use this MCP server with Claude, you need to add it to the MCP settings file. Here's how to configure it:

### For Node.js Deployment

Add the following to the MCP settings file:

```json
{
  "mcpServers": {
    "people-info": {
      "command": "node",
      "args": ["index.js"],
      "cwd": "/path/to/people-info-server",
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### For Docker Deployment

Add the following to the MCP settings file:

```json
{
  "mcpServers": {
    "people-info": {
      "command": "docker",
      "args": ["run", "-i", "--env-file", "/path/to/.env", "mcp-people-info-server"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### Combined Configuration

For a complete setup with both servers, see the `combined_mcp_settings_sample.json` file in the root directory.

## Using the Tool

Once the MCP server is configured and running, you can use the `get_people_info` tool with Claude:

```
<use_mcp_tool>
<server_name>people-info</server_name>
<tool_name>get_people_info</tool_name>
<arguments>
{
  "title": "developer"
}
</arguments>
</use_mcp_tool>
```

The tool will return information about the specified job title. The process works as follows:

1. First, Claude analyzes the job title to categorize it as DEVELOPER, DESIGNER, or OTHER
2. Based on the category:
   - For developer titles: It dynamically starts the developer-info server and calls its tool to get the name "Neick"
   - For designer titles: It dynamically starts the designer-info server and calls its tool to get the name "Jesse"
   - For other titles: It skips the name lookup step and server starting
3. It then uses Claude to generate a detailed, personalized description based on the name and title

## Dynamic Orchestration of Specialized MCP Servers

This server demonstrates a sophisticated dynamic orchestration pattern:

1. It uses Claude's intelligence to analyze and categorize job titles
2. It dynamically starts different specialized MCP servers based on the job category:
   - The developer-info server for developer-related titles
   - The designer-info server for designer-related titles
3. It calls the appropriate tool from the started server to retrieve specialized information
4. It uses Claude again to generate detailed, contextual responses based on the information gathered
5. It terminates the specialized server after use to conserve resources

This approach leverages both the power of LLMs for analysis and content generation, and the on-demand starting of specialized MCP servers for retrieving specific information only when needed.

See the main README.md for more information on how these servers work together.