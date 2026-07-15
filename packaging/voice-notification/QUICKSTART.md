# Voice Notification — Portable Install

This bundle installs the Voice Notification Codex plugin independently of the
repository or project where you plan to use it.

## Requirements

- macOS with `/usr/bin/say`
- Node.js 20 or newer
- Codex CLI
- FFmpeg in `/opt/homebrew/bin/ffmpeg` or `/usr/local/bin/ffmpeg` for voice confirmation
- `GROQ_API_KEY` visible to the Codex process for voice confirmation

## Install

```bash
tar -xzf voice-notification-local.tar.gz
cd voice-notification-local
./install.sh
```

Restart Codex after installation and create a new task in any unrelated
project. The plugin is installed through its own local marketplace; nothing
needs to be copied into that project.

## Try it

Give Codex this instruction in the new project:

> Improve the sorting algorithm. When the change is ready and you cannot
> continue without my review, use `notify_user` with
> `confirmationMode: "voice"`, then wait for my explicit confirmation.

Codex should speak the request. Start answering within five seconds with an
explicit phrase such as “confirmed” or “not yet.” Silence, noise, unavailable
voice capture, or an unclear transcript falls back to typed confirmation.

Use `confirmationMode: "text"` to test without Groq or microphone access.
