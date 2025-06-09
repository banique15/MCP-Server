# Developer Info MCP Server

A simple MCP server that exposes a `get_developer_name` tool that returns "Neick".

## Project Structure

- `index.js`: Main server implementation
- `package.json`: Node.js project configuration
- `Dockerfile`: Docker configuration for containerization
- `mcp_settings_sample.json`: Sample MCP settings for this server

## Building and Running

### Install Dependencies

```bash
npm install
```

### Run with Node.js

```bash
npm start
```

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t mcp-developer-server .

# Run the Docker container
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
      "command": "node",
      "args": ["index.js"],
      "cwd": "/path/to/developer-info-server",
      "disabled": false,
      "alwaysAllow": ["people-info"]
    }
  }
}
```

### For Docker Deployment

```json
{
  "mcpServers": {
    "developer-info": {
      "command": "docker",
      "args": ["run", "-i", "mcp-developer-server"],
      "disabled": false,
      "alwaysAllow": ["people-info"]
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

## Integration with People Info Server

This server is designed to work with the people-info server. The people-info server will call this server's `get_developer_name` tool when it needs information about developers.

See the main README.md for more information on how these servers work together.