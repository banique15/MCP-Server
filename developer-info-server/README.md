# Simple MCP Server

A simple MCP server that exposes a `get_developer_name` tool that returns "Neick".

## Project Structure

- `index.js`: Main server implementation
- `package.json`: Node.js project configuration
- `Dockerfile`: Docker configuration for containerization

## Building and Running

### Build the Docker Image

```bash
docker build -t mcp-developer-server .
```

### Run the Docker Container

```bash
docker run -i mcp-developer-server
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
    "developer-info": {
      "command": "docker",
      "args": ["run", "-i", "mcp-developer-server"],
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
    "developer-info": {
      "command": "docker",
      "args": ["run", "-i", "mcp-developer-server"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Using the Tool

Once the MCP server is configured and running, you can use the `get_developer_name` tool with Claude:

```
<use_mcp_tool>
<server_name>developer-info</server_name>
<tool_name>get_developer_name</tool_name>
<arguments>
{}
</arguments>
</use_mcp_tool>
```

The tool will return "Neick" as the developer name.