# Voice Notification — Portable Install

This bundle installs the Voice Notification Codex plugin independently of the
repository or project where you plan to use it.

## Requirements

- macOS with `/usr/bin/say`
- Node.js 20 or newer
- Codex CLI
- An ElevenLabs API key for default Sarah cloud speech; omit it to use local macOS `say`
- FFmpeg in `/opt/homebrew/bin/ffmpeg` or `/usr/local/bin/ffmpeg` for voice responses
- `GROQ_API_KEY` visible to the Codex process for voice responses

## Install

```bash
tar -xzf voice-notification-local.tar.gz
cd voice-notification-local
cp plugins/voice-notification/.env.example plugins/voice-notification/.env
# Edit plugins/voice-notification/.env and set GROQ_API_KEY and/or ELEVENLABS_API_KEY.
./install.sh
```

Restart Codex after installation and create a new task in any unrelated
project. The plugin is installed through its own local marketplace; nothing
needs to be copied into that project.

## Try it

Give Codex this instruction in the new project:

> Improve the sorting algorithm. When the change is ready and you cannot
> continue without my review, use `notify_user` with
> `confirmationMode: "voice"`, then treat my spoken response as my next message.

Codex should speak the request. Start answering naturally within five seconds.
The complete non-empty transcript is returned to the task. Silence, noise,
unavailable voice capture, or an empty transcript falls back to typed input.
Do not speak secrets or sensitive data.

With `ELEVENLABS_API_KEY` configured, notification text is synthesized with the
default English `Sarah` voice. Without that key, notification speech stays local through
macOS `say`. A configured ElevenLabs failure does not fall back to local speech.

Create the plugin-local `.env` before installation so it is included in the
installed private plugin copy. The bundle generator and Git both exclude the
real `.env`. Use `confirmationMode: "text"` to test without Groq or microphone
access; omit `ELEVENLABS_API_KEY` to test macOS `say`.
