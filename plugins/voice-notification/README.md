# Voice Notification Plugin

A local macOS Codex plugin that exposes one MCP tool, `notify_user`, for speaking a short human-attention request through `/usr/bin/say`. It is intended for tasks genuinely blocked on a real-world action, not routine status updates.

## Requirements

- macOS with `/usr/bin/say`
- Node.js 20 or newer
- An active, audible output device
- Person 3's `src/notify-user.js` implementation, which supplies the authoritative validation and speech handler used by the MCP entry point

## Develop and test

From `plugins/voice-notification`:

```bash
npm install
npm test
npm start
```

`npm start` runs the STDIO MCP server and waits for protocol input; it is normally launched by Codex rather than used interactively. Keep standard output reserved for MCP protocol messages.

## Install through the repository marketplace

From the repository root, add the repository as a personal marketplace and install the plugin:

```bash
codex plugin marketplace add <repo-root>
codex plugin add voice-notification@personal
```

Replace `<repo-root>` with the absolute path to this checkout. After changing plugin files, refresh or reinstall the plugin with the current Codex plugin commands, then start a new Codex task so tool discovery is reloaded. Confirm that the task exposes exactly `notify_user` before the demo.

## Direct project-scoped MCP fallback

If plugin discovery is unavailable, configure the same server directly as a project-scoped STDIO MCP server. Use the plugin directory as the working directory and run:

```text
node ./src/index.js
```

This fallback changes packaging only; it must use the same entry point and Person 3 handler. Disclose the fallback during the demo rather than describing it as a plugin install.

## Safe use

- Call `notify_user` only when a task cannot continue without a person's action or decision.
- Send only a short, trusted summary. Never send secrets, credentials, raw tool output, private code, or personal data.
- Call once, report the structured result, and wait for explicit human confirmation. Do not retry automatically.
- Treat `urgency` as metadata only. It does not change volume or interrupt other audio.
- A `spoken` result means the local speech process completed; it does not prove the user heard the message or performed the requested action.

## MVP limitations

- macOS only; speech depends on `/usr/bin/say` and the machine's current audio routing and volume.
- Audio may be muted, routed to speakers instead of headphones, inaccessible to some users, or overheard.
- No automatic retry, notification history, acknowledgement, timeout, cancellation, duplicate suppression, or durable state.
- The plugin does not complete or verify the requested real-world action.
