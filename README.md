# MCP Server Project

This project contains three Model Context Protocol (MCP) servers that work together:

1. **developer-info**: Provides information about developers
2. **designer-info**: Provides information about designers
3. **people-info**: Provides information about people based on their job title, and integrates with both the developer-info and designer-info servers

## Project Structure

```
MCP-Server/
├── combined_mcp_settings_sample.json  # Combined settings for both servers
├── developer-info-server/             # Developer info MCP server
│   ├── Dockerfile                     # Docker configuration
│   ├── index.js                       # Server implementation
│   ├── mcp_settings_sample.json       # MCP settings for this server
│   ├── package.json                   # Dependencies
│   └── README.md                      # Documentation
└── people-info-server/                # People info MCP server
    ├── .env                           # Environment variables (create from .env.template)
    ├── .env.template                  # Template for environment variables
    ├── Dockerfile                     # Docker configuration
    ├── index.js                       # Server implementation
    ├── mcp_settings_sample.json       # MCP settings for this server
    ├── package.json                   # Dependencies
    └── README.md                      # Documentation
```

## How It Works

1. The `developer-info` server provides a tool called `get_developer_name` that returns "Neick".
2. The `designer-info` server provides a tool called `get_designer_name` that returns "Jesse".
3. The `people-info` server provides a tool called `get_people_info` that takes a job title parameter.
4. When `get_people_info` is called:
   - It first uses Claude to analyze the job title and categorize it as DEVELOPER, DESIGNER, or OTHER
   - If it's developer-related, it dynamically starts the `developer-info` server and calls its `get_developer_name` tool
   - If it's designer-related, it dynamically starts the `designer-info` server and calls its `get_designer_name` tool
   - It then uses Claude to generate a detailed, personalized description based on the name and title
   - For other titles, it uses Claude to generate general information about the job title without starting any additional servers

## Setup Instructions

### 1. Install Dependencies

Run the following commands in both server directories:

```bash
cd developer-info-server
npm install

cd ../people-info-server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `people-info-server` directory based on the `.env.template`:

```bash
cd people-info-server
cp .env.template .env
```

Edit the `.env` file to add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Configure MCP Settings

Copy the `combined_mcp_settings_sample.json` to your MCP settings location:

```bash
cp combined_mcp_settings_sample.json /path/to/your/mcp_settings.json
```

Update the paths in the settings file to match your actual installation paths.

## Running the Servers

You can run both servers directly using Node.js:

```bash
# Run the developer-info server
cd developer-info-server
npm start

# Run the people-info server
cd people-info-server
npm start
```

Or you can build and run the Docker containers:

```bash
# Build and run the developer-info server
cd developer-info-server
docker build -t mcp-developer-server .
docker run -i mcp-developer-server

# Build and run the people-info server
cd people-info-server
docker build -t mcp-people-info-server .
docker run -i --env-file .env mcp-people-info-server
```

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

## Dynamic MCP Server Orchestration

This project demonstrates a dynamic MCP server orchestration architecture that combines:

1. **LLM Analysis**: Using Claude to analyze and categorize job titles
2. **Dynamic Server Management**: The people-info server starts specialized servers on-demand based on the job category
3. **Contextual Content Generation**: Using Claude to generate detailed, personalized responses

The flow works like this:

1. Claude calls the `get_people_info` tool provided by the people-info server
2. The people-info server uses Claude to analyze and categorize the job title
3. Based on the category:
   - For developer titles: It dynamically starts the developer-info server and calls its tool
   - For designer titles: It dynamically starts the designer-info server and calls its tool
   - For other titles: It uses Claude directly without starting additional servers
4. It then uses Claude to generate a personalized response based on the name and title
5. The result flows back to the original Claude

This approach demonstrates how a primary MCP server can dynamically orchestrate specialized MCP servers on-demand, starting them only when needed and terminating them after use. This creates a more efficient and scalable architecture where resources are only used when required.