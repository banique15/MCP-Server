# People Info MCP Orchestrator v2.0

An intelligent Model Context Protocol (MCP) orchestrator server that analyzes natural language queries and dynamically calls specialized MCP servers (developer-info and designer-info) to provide comprehensive responses.

## 🧠 How It Works

This server acts as an **intelligent orchestrator** that:

1. **Receives natural language queries** about people information
2. **Uses Claude AI to analyze** what type of information is being requested
3. **Dynamically starts and connects** to appropriate specialized MCP servers
4. **Calls the right tools** on those servers to get the data
5. **Enhances the response** using Claude AI for natural, conversational answers

## 🏗️ Architecture

```
User Query → People-Info Server → Claude Analysis → MCP Server Selection → Tool Execution → Enhanced Response
```

### Example Flow:
1. User asks: *"What is the developer's name?"*
2. People-info server analyzes with Claude: *"This is asking for developer name"*
3. Server starts `developer-info` MCP server
4. Calls `get_developer_name` tool on developer-info server
5. Gets result: *"Neick"*
6. Enhances response: *"The developer's name is Neick."*

## 🛠️ Available Tool

### `get_people_info`
The main orchestrator tool that handles all people-related queries.

**Parameters:**
- `query` (string): Natural language query about people information

**Example Queries:**
- *"What is the developer's name?"*
- *"Tell me about the designer"*
- *"Who is the frontend developer?"*
- *"What does the designer do?"*

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.template .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Ensure Other Servers Exist
Make sure you have the following server directories at the same level:
- `../developer-info-server/` (with working MCP server)
- `../designer-info-server/` (with working MCP server)

### 4. Configure Claude Desktop
Add only this server to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "people-info": {
      "command": "node",
      "args": ["/path/to/your/people-info-server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_anthropic_api_key_here"
      }
    }
  }
}
```

## 🎯 Usage Examples

### In Claude Desktop:

**Query 1: Get Developer Name**
```xml
<use_mcp_tool>
<server_name>people-info</server_name>
<tool_name>get_people_info</tool_name>
<arguments>
{
  "query": "What is the developer's name?"
}
</arguments>
</use_mcp_tool>
```

**Query 2: Get Designer Information**
```xml
<use_mcp_tool>
<server_name>people-info</server_name>
<tool_name>get_people_info</tool_name>
<arguments>
{
  "query": "Tell me about the designer"
}
</arguments>
</use_mcp_tool>
```

**Query 3: General Developer Question**
```xml
<use_mcp_tool>
<server_name>people-info</server_name>
<tool_name>get_people_info</tool_name>
<arguments>
{
  "query": "Who is the frontend developer on the team?"
}
</arguments>
</use_mcp_tool>
```

## 🔧 Technical Details

### Dynamic Server Management
- **On-Demand Starting**: Specialized servers are only started when needed
- **Connection Reuse**: Maintains connections to avoid repeated startup overhead
- **Automatic Cleanup**: Properly closes connections when shutting down

### AI-Powered Analysis
- **Query Understanding**: Uses Claude 3.5 Sonnet to understand user intent
- **Smart Routing**: Determines which server and tool to call based on the query
- **Response Enhancement**: Generates natural, conversational responses

### MCP Client Integration
- **Real MCP Communication**: Uses proper MCP protocol to communicate with other servers
- **Error Handling**: Graceful fallbacks when servers are unavailable
- **Process Management**: Manages child processes for specialized servers

## 🏆 Benefits

1. **Natural Language Interface**: Ask questions in plain English
2. **Intelligent Routing**: Automatically determines which server to call
3. **Separation of Concerns**: Each server maintains its own data
4. **Scalable Architecture**: Easy to add new specialized servers
5. **Enhanced Responses**: AI-generated natural language responses

## 🐛 Troubleshooting

### Server Not Found Errors
- Ensure `developer-info-server` and `designer-info-server` directories exist
- Check that both servers have working `index.js` files
- Verify the relative paths in the code match your directory structure

### Connection Issues
- Check that your ANTHROPIC_API_KEY is valid
- Ensure the specialized servers can run independently
- Look at the console logs for detailed error information

## 📁 Required Directory Structure

```
parent-directory/
├── people-info-server/          # This orchestrator server
│   ├── index.js
│   ├── package.json
│   └── .env
├── developer-info-server/       # Developer data server
│   ├── index.js
│   └── package.json
└── designer-info-server/        # Designer data server
    ├── index.js
    └── package.json
```

## 🔄 Version History

- **v2.0.0**: Intelligent orchestrator with proper MCP client integration
- **v1.0.0**: Original multi-server approach (deprecated)