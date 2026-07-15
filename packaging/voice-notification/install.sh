#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_ROOT="$ROOT/plugins/voice-notification"
MARKETPLACE_NAME="voice-notification-local"

for command_name in node npm codex; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

node -e 'if (Number(process.versions.node.split(".")[0]) < 20) process.exit(1)' || {
  echo "Node.js 20 or newer is required." >&2
  exit 1
}

echo "Installing pinned plugin dependencies..."
npm ci --prefix "$PLUGIN_ROOT"
npm test --prefix "$PLUGIN_ROOT"

echo "Registering the portable marketplace..."
codex plugin marketplace add "$ROOT"
codex plugin add "voice-notification@$MARKETPLACE_NAME"

echo
echo "Installed voice-notification from $ROOT"
echo "Restart Codex and open a new task in any project."
echo "For voice confirmation, expose GROQ_API_KEY to the Codex process before starting it."
echo "Text confirmation does not require a Groq API key or microphone access."
