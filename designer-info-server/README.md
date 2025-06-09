# Designer Info MCP Server

A simple MCP server that exposes a `get_designer_name` tool that returns "Jesse".

## Project Structure

- `index.js`: Main server implementation
- `package.json`: Node.js project configuration
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
docker build -t mcp-designer-server .

# Run the Docker container
docker run -i mcp-designer-server
```

Note: The `-i` flag is important as it keeps stdin open, which is required for stdio communication.

## MCP Server Configuration

To use this MCP server with Claude, you need to add it to the MCP settings file. Here's how to configure it:

### For Node.js Deployment

Add the following to the MCP settings file:

```json
{
  "mcpServers": {
    "designer-info": {
      "command": "node",
      "args": ["index.js"],
      "cwd": "/path/to/designer-info-server",
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
    "designer-info": {
      "command": "docker",
      "args": ["run", "-i", "mcp-designer-server"],
      "disabled": false,
      "alwaysAllow": ["people-info"]
    }
  }
}
```

## Using the Tool

Once the MCP server is configured and running, you can use the `get_designer_name` tool with Claude:

```
<use_mcp_tool>
<server_name>designer-info</server_name>
<tool_name>get_designer_name</tool_name>
<arguments>
{}
</arguments>
</use_mcp_tool>
```

The tool will return "Jesse" as the designer name.

## Integration with People Info Server

This server is designed to work with the people-info server. The people-info server will call this server's `get_designer_name` tool when it needs information about designers.

See the main README.md for more information on how these servers work together.