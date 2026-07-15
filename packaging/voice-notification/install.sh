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

PLUGIN_VERSION=$(node -e \
  'const fs=require("node:fs"); const path=process.argv[1]; process.stdout.write(JSON.parse(fs.readFileSync(path,"utf8")).version)' \
  "$PLUGIN_ROOT/.codex-plugin/plugin.json")
CODEX_ROOT=${CODEX_HOME:-$(node -e 'process.stdout.write(require("node:os").homedir()+"/.codex")')}
INSTALLED_ROOT="$CODEX_ROOT/plugins/cache/$MARKETPLACE_NAME/voice-notification/$PLUGIN_VERSION"

if [ -f "$PLUGIN_ROOT/.env" ]; then
  if [ ! -d "$INSTALLED_ROOT" ]; then
    echo "Installed plugin directory was not found: $INSTALLED_ROOT" >&2
    exit 1
  fi
  umask 077
  cp "$PLUGIN_ROOT/.env" "$INSTALLED_ROOT/.env"
  chmod 600 "$INSTALLED_ROOT/.env"
  echo "Copied plugin-local environment to the installed private plugin directory."
fi

echo
echo "Installed voice-notification from $ROOT"
echo "Restart Codex and open a new task in any project."
echo "For voice responses, set GROQ_API_KEY in $PLUGIN_ROOT/.env before installation."
echo "For ElevenLabs default Sarah speech, set ELEVENLABS_API_KEY in the same file."
echo "Without ELEVENLABS_API_KEY, notification speech uses local macOS say."
echo "Typed input does not require a Groq API key or microphone access."
