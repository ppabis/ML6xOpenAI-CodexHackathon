#!/bin/sh
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PLUGIN_ROOT="$REPO_ROOT/plugins/voice-notification"
OUTPUT_DIR="$REPO_ROOT/dist"
OUTPUT="$OUTPUT_DIR/voice-notification-local.tar.gz"
STAGING_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/voice-notification-package.XXXXXX")
BUNDLE_ROOT="$STAGING_ROOT/voice-notification-local"

cleanup() {
  rm -rf "$STAGING_ROOT"
}
trap cleanup EXIT INT TERM

mkdir -p "$BUNDLE_ROOT/.agents/plugins" "$BUNDLE_ROOT/plugins"
cp "$REPO_ROOT/.agents/plugins/marketplace.json" \
  "$BUNDLE_ROOT/.agents/plugins/marketplace.json"
rsync -a \
  --exclude node_modules/ \
  --exclude .env \
  --exclude .DS_Store \
  "$PLUGIN_ROOT/" "$BUNDLE_ROOT/plugins/voice-notification/"
cp "$REPO_ROOT/packaging/voice-notification/install.sh" "$BUNDLE_ROOT/install.sh"
cp "$REPO_ROOT/packaging/voice-notification/QUICKSTART.md" "$BUNDLE_ROOT/QUICKSTART.md"
chmod 755 "$BUNDLE_ROOT/install.sh"

mkdir -p "$OUTPUT_DIR"
COPYFILE_DISABLE=1 tar -czf "$OUTPUT" -C "$STAGING_ROOT" voice-notification-local

echo "Created: $OUTPUT"
shasum -a 256 "$OUTPUT"
