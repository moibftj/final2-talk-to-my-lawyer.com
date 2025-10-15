#!/bin/bash

# Claude Code Setup Script for Z.AI
# This script configures Claude Code to work with Z.AI API

set -e

echo "🚀 Setting up Claude Code with Z.AI API..."

# Create .claude directory if it doesn't exist
CLAUDE_DIR="$HOME/.claude"
mkdir -p "$CLAUDE_DIR"

# Your Z.AI API key
ZAI_API_KEY="8398aa79f8d040dda0d7abe3a5eba843.hNUNIJz1hZuzxGXa"

# Create or update settings.json
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

echo "📝 Creating Claude Code configuration..."

cat > "$SETTINGS_FILE" << EOF
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "$ZAI_API_KEY",
        "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
        "API_TIMEOUT_MS": "3000000",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
        "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.6",
        "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.6"
    }
}
EOF

echo "✅ Configuration file created at: $SETTINGS_FILE"
echo ""
echo "📋 Configuration summary:"
echo "  API Key: ${ZAI_API_KEY:0:20}..."
echo "  Base URL: https://api.z.ai/api/anthropic"
echo "  Timeout: 3000000ms"
echo "  Default Models:"
echo "    - Haiku: glm-4.5-air"
echo "    - Sonnet: glm-4.6"
echo "    - Opus: glm-4.6"
echo ""

# Validate JSON format
if command -v python3 &> /dev/null; then
    echo "🔍 Validating JSON format..."
    if python3 -m json.tool "$SETTINGS_FILE" > /dev/null 2>&1; then
        echo "✅ JSON format is valid"
    else
        echo "❌ JSON format is invalid"
        exit 1
    fi
fi

echo ""
echo "🎉 Claude Code setup complete!"
echo ""
echo "Next steps:"
echo "1. Open a new terminal window"
echo "2. Navigate to your project directory: cd /workspaces/final2-talk-to-my-lawyer.com"
echo "3. Run: claude"
echo "4. When prompted 'Do you want to use this API key?' select 'Yes'"
echo "5. Grant Claude Code permission to access files in your folder"
echo "6. Type '/status' to check the current model status"
echo ""
echo "💡 Troubleshooting:"
echo "- If changes don't take effect, close all Claude Code windows and restart"
echo "- If issues persist, delete ~/.claude/settings.json and run this script again"