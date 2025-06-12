# 🚀 Quick Start Guide - MCP Orchestrator System

## 🎯 What This Does

Ask natural language questions and get intelligent responses powered by dynamic MCP server orchestration:

- *"What is the developer's name?"* → Calls developer-info server → *"The developer's name is Neick."*
- *"Tell me about the designer"* → Calls designer-info server → *"The designer's name is Jesse."*

## 🚨 **IMPORTANT: Path Configuration for New Users**

If you're setting up this project on a **different machine**, you need to update **2 critical paths**:

### **1. Update Node.js Path in Code**
Edit [`people-info-server/index.js`](people-info-server/index.js) line 84:
```javascript
// Change this hardcoded path:
command: '/Users/banik/.nvm/versions/node/v22.16.0/bin/node',

// To use your system's Node.js:
command: 'node',
```

### **2. Update Project Path in Claude Desktop Settings**
In step 2 below, replace `/Users/banik/Desktop/Projects2025/MCP-Server/` with **your actual project path**.

---

## ⚡ One-Command Setup

```bash
./setup.sh
```

## 📋 Manual Setup (3 steps)

### 1. Install & Configure
```bash
cd people-info-server
npm install
cp .env.template .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Add to Claude Desktop
Add **only the orchestrator** to your MCP settings:

**⚠️ IMPORTANT: Replace the path below with YOUR actual project path!**

```json
{
  "mcpServers": {
    "people-info": {
      "command": "node",
      "args": ["/YOUR/ACTUAL/PATH/TO/MCP-Server/people-info-server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_anthropic_api_key_here"
      }
    }
  }
}
```

**Example paths for different systems:**
- **macOS**: `"/Users/yourname/Desktop/MCP-Server/people-info-server/index.js"`
- **Windows**: `"C:\\Users\\yourname\\Desktop\\MCP-Server\\people-info-server\\index.js"`
- **Linux**: `"/home/yourname/Desktop/MCP-Server/people-info-server/index.js"`

### 3. Restart Claude Desktop

## 🧪 Test It

Try these natural language queries in Claude Desktop:

### Developer Questions
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

```xml
<use_mcp_tool>
<server_name>people-info</server_name>
<tool_name>get_people_info</tool_name>
<arguments>
{
  "query": "Who is the frontend developer?"
}
</arguments>
</use_mcp_tool>
```

### Designer Questions
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

```xml
<use_mcp_tool>
<server_name>people-info</server_name>
<tool_name>get_people_info</tool_name>
<arguments>
{
  "query": "What does the designer do?"
}
</arguments>
</use_mcp_tool>
```

## 🔍 How It Works Behind the Scenes

1. **You ask**: *"What is the developer's name?"*
2. **Orchestrator analyzes** with Claude AI: *"This is asking for developer name"*
3. **Dynamically starts** developer-info MCP server
4. **Calls** `get_developer_name` tool via MCP protocol
5. **Gets response**: *"Neick"*
6. **Enhances with Claude**: *"The developer's name is Neick."*
7. **You receive** natural, conversational answer

## ✅ What You Get

- **🧠 Smart Query Analysis**: AI understands what you're asking
- **🔄 Dynamic Server Management**: Specialized servers start only when needed
- **💬 Natural Language Interface**: Ask questions in plain English
- **🎯 Accurate Routing**: Right question goes to right server
- **✨ Enhanced Responses**: Raw data becomes conversational answers
- **🏗️ Proper MCP Protocol**: Real server-to-server communication

## 🎮 Try These Queries

- *"What is the developer's name?"*
- *"Who is the designer?"*
- *"Tell me about the frontend developer"*
- *"What does the designer do?"*
- *"Who handles the development work?"*
- *"What's the name of the person who does design?"*

## 🚨 Troubleshooting

**Server not found errors?**
- Make sure `developer-info-server` and `designer-info-server` directories exist
- Check that both have working `index.js` files
- **Verify you updated the Node.js path** in `people-info-server/index.js` line 84

**Connection issues?**
- Verify your ANTHROPIC_API_KEY is correct
- **Double-check your project path** in Claude Desktop MCP settings
- Check Claude Desktop logs for detailed errors

**"Command not found" or "ENOENT" errors?**
- **Update the hardcoded Node.js path** in `people-info-server/index.js` line 84 to `'node'`
- Make sure Node.js is installed and accessible via `node` command

**No response?**
- Try restarting Claude Desktop
- Make sure the query is about developers or designers
- **Verify both path changes were made** (Node.js path + Claude Desktop path)

---

**That's it!** You now have an intelligent MCP orchestration system that understands natural language and dynamically coordinates multiple servers. 🎉

**Perfect for**: Demos, learning MCP patterns, building intelligent multi-server systems, understanding AI-powered request routing.