# MCP Server Project

This project contains multiple Model Context Protocol (MCP) servers that demonstrate different capabilities and patterns for extending Claude's functionality.

## Project Structure

The project is organized into separate directories for each MCP server:

- `/developer-info-server/` - A simple MCP server that provides developer information
  - Provides a `get_developer_name` tool that returns "Neick"
  - Demonstrates basic MCP server implementation

- `/people-info-server/` - An MCP server that demonstrates nested tool calling
  - Provides a `get_people_info` tool that takes a title parameter
  - Uses the Anthropic API to call Claude
  - That Claude instance can use the `get_developer_name` tool
  - Demonstrates LLM tool chaining pattern

## Getting Started

Each server directory contains its own README.md with specific instructions for building, running, and using that server.

### Quick Start

1. Build and run the developer-info server:
   ```bash
   cd developer-info-server
   docker build -t mcp-developer-server .
   docker run -i mcp-developer-server
   ```

2. Configure and run the people-info server:
   ```bash
   cd people-info-server
   # Edit .env to add your Anthropic API key
   docker build -t mcp-people-info-server .
   docker run -i --env-file .env mcp-people-info-server
   ```

3. Configure MCP settings:
   See `combined_mcp_settings_sample.json` for an example of how to configure both servers in your MCP settings file.

## Using the MCP Servers

### Developer Info Server

```
<use_mcp_tool>
<server_name>developer-info</server_name>
<tool_name>get_developer_name</tool_name>
<arguments>
{}
</arguments>
</use_mcp_tool>
```

### People Info Server

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

## Nested Tool Calling Pattern

This project demonstrates a powerful pattern for tool chaining where one LLM can leverage the capabilities of another LLM through tools, creating a nested architecture that can solve complex problems.

The flow works like this:
1. Claude calls the `get_people_info` tool provided by the people-info server
2. The people-info server calls Anthropic's API (another Claude instance)
3. That Claude instance uses the `get_developer_name` tool from the developer-info server
4. The result flows back up the chain to the original Claude