# Voice Notification Plugin

A local macOS Codex plugin that exposes one MCP tool, `notify_user`, for speaking a short human-attention request through `/usr/bin/say` and waiting for typed or bounded voice confirmation.

## Requirements

- macOS with `/usr/bin/say`
- Node.js 20.6 or newer
- An active, audible output device
- `ffmpeg` with macOS AVFoundation support for optional streaming voice confirmation
- A Groq API key for optional voice confirmation; transcription is pinned to `whisper-large-v3-turbo`

## Develop and test

From `plugins/voice-notification`:

```bash
npm install
npm test
npm start
```

For local voice-confirmation development, create an untracked repository-root `.env`:

```text
GROQ_API_KEY=your-key
```

Never commit this file or paste the key into task messages. `npm start` loads the repository-root `.env` when it exists. An installed Codex plugin instead receives `GROQ_API_KEY` from the Codex host environment through its MCP configuration.

`npm start` runs the STDIO MCP server and waits for protocol input; it is normally launched by Codex rather than used interactively. Keep standard output reserved for MCP protocol messages.

## Install through the repository marketplace

From the repository root, add the repository as a personal marketplace and install the plugin:

```bash
codex plugin marketplace add <repo-root>
codex plugin add voice-notification@voice-notification-local
```

Replace `<repo-root>` with the absolute path to this checkout. After changing plugin files, refresh or reinstall the plugin with the current Codex plugin commands, then start a new Codex task so tool discovery is reloaded. Confirm that the task exposes exactly `notify_user` before the demo.

## Direct project-scoped MCP fallback

If plugin discovery is unavailable, configure the same server directly as a project-scoped STDIO MCP server. Use the plugin directory as the working directory and run:

```text
node ./src/index.js
```

This fallback changes packaging only; it uses the same production entry point and safe validation/speech handler. Disclose the fallback during the demo rather than describing it as a plugin install.

## Safe use

- Call `notify_user` only when a task cannot continue without a person's action or decision.
- Send only a short, trusted summary. Never send secrets, credentials, raw tool output, private code, or personal data.
- Titles are limited to 40 characters and messages to 200 characters.
- Call once, report the structured result, and wait for explicit human confirmation. Do not retry automatically.
- `confirmationMode: "text"` returns `awaiting_confirmation` and keeps confirmation in the Codex task.
- `confirmationMode: "voice"` waits up to five seconds for actual speech to begin. Noise alone is ignored by the bundled local Silero VAD model.
- After speech begins, recording continues until five seconds without detected speech, with a 30-second hard utterance limit and 500 ms of pre-roll to avoid clipping the first word.
- Voice activity detection runs locally through the bundled, checksum-pinned ONNX model. Only one completed temporary clip is sent to Groq, using exactly `whisper-large-v3-turbo`.
- Only a small explicit confirmation/decline phrase set is accepted. No speech, ambiguous speech, a busy microphone, missing microphone access, missing `ffmpeg`, unavailable ONNX inference, missing API credentials, and Groq failures fall back to typed confirmation.
- Treat `urgency` as metadata only. It does not change volume or interrupt other audio.
- A `spoken` result means the local speech process completed; it does not prove the user heard the message or performed the requested action.

## MVP limitations

- macOS only; speech depends on `/usr/bin/say` and the machine's current audio routing and volume.
- Audio may be muted, routed to speakers instead of headphones, inaccessible to some users, or overheard.
- Voice confirmation sends a temporary audio clip to Groq. The clip is deleted locally after transcription, and neither audio nor transcript is returned or logged.
- Microphone access must be granted explicitly by macOS. Listening occurs only for one requested confirmation, stops after five seconds without an onset, and is capped at 30 seconds after speech begins.
- Only one microphone capture can run at a time. The ONNX session stays warm for efficient sequential confirmations, while detector state is reset between captures.
- No automatic retry, notification history, cancellation, duplicate suppression, or durable state.
- The plugin does not complete or verify the requested real-world action.
