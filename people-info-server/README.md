# People Info MCP Server

An MCP server that provides a `get_people_info` tool that uses LLM chaining to get information about people with specific job titles. When asked about developers, it will use the `get_developer_name` tool from another MCP server.

## Architecture

This server demonstrates a nested LLM tool calling architecture:

1. Claude (Roo) calls the `get_people_info` tool provided by this server
2. This server calls Anthropic's API (Claude)
3. That Claude instance can use the `get_developer_name` tool
4. The result flows back up the chain to the original Claude (Roo)

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

### For VSCode Extension

Add the following to the MCP settings file located at:
`~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`

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

### For Claude Desktop App

Add the following to the Claude desktop app configuration file located at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

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

The tool will return information about the specified job title. If the title is "developer" or similar, it will use the `get_developer_name` tool to get the name of the developer.