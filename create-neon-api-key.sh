#!/bin/bash

# Script to create Neon API key via API
# You'll need to provide your Neon account email and password

echo "Neon API Key Creation Script"
echo "============================"
echo ""

# Prompt for credentials
read -p "Enter your Neon account email: " NEON_EMAIL
read -sp "Enter your Neon account password: " NEON_PASSWORD
echo ""

# Step 1: Authenticate and get access token
echo "Step 1: Authenticating..."
AUTH_RESPONSE=$(curl -s --request POST \
  --url 'https://console.neon.tech/api/v2/auth/token' \
  --header 'Content-Type: application/json' \
  --data "{
    \"username\": \"$NEON_EMAIL\",
    \"password\": \"$NEON_PASSWORD\"
  }")

# Extract access token
ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Authentication failed!"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Authentication successful!"
echo ""

# Step 2: Create API key
echo "Step 2: Creating API key..."
API_KEY_RESPONSE=$(curl -s --request POST \
  --url 'https://console.neon.tech/api/v2/api_keys' \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "key_name": "MCP-Integration-Key"
  }')

# Extract API key
API_KEY=$(echo $API_KEY_RESPONSE | grep -o '"key":"[^"]*' | cut -d'"' -f4)
API_KEY_ID=$(echo $API_KEY_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
  echo "❌ Failed to create API key!"
  echo "Response: $API_KEY_RESPONSE"
  exit 1
fi

echo "✅ API key created successfully!"
echo ""
echo "=========================================="
echo "IMPORTANT: Save this API key immediately!"
echo "=========================================="
echo "API Key ID: $API_KEY_ID"
echo "API Key: $API_KEY"
echo ""
echo "This key will NOT be shown again!"
echo ""

# Update mcp.json
read -p "Do you want to update mcp.json with this API key? (y/n): " UPDATE_MCP
if [ "$UPDATE_MCP" = "y" ] || [ "$UPDATE_MCP" = "Y" ]; then
  # Get project ID from DATABASE_URL
  PROJECT_ID=$(grep DATABASE_URL .env.local | grep -o 'ep-[^.]*' | head -1 | sed 's/-pooler//')
  
  cat > ~/.cursor/mcp.json << EOF
{
  "mcpServers": {
    "neon": {
      "command": "npx",
      "args": [
        "-y",
        "@neondatabase/mcp-server-neon",
        "start",
        "$API_KEY"
      ]
    }
  }
}
EOF
  echo "✅ mcp.json updated!"
  echo "Please restart Cursor to enable Neon MCP."
fi

