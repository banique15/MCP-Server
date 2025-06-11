#!/bin/bash

echo "🚀 Setting up People Info MCP Server..."

# Navigate to the server directory
cd people-info-server

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.template .env
    echo "⚠️  Please edit .env file and add your ANTHROPIC_API_KEY"
else
    echo "✅ .env file already exists"
fi

# Make the script executable
chmod +x index.js

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit people-info-server/.env and add your ANTHROPIC_API_KEY"
echo "2. Add the following to your Claude Desktop MCP settings:"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"people-info\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"index.js\"],"
echo "      \"cwd\": \"$(pwd)\","
echo "      \"env\": {"
echo "        \"ANTHROPIC_API_KEY\": \"your_anthropic_api_key_here\""
echo "      }"
echo "    }"
echo "  }"
echo "}"
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "🎉 You're ready to use the People Info MCP Server!"