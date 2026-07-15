---
name: voice-notification
description: Speak a short local voice notification when a Codex task genuinely needs human attention and the user may be away from the window.
---

# Voice Notification

Use `notify_user` only when a task needs human attention and the request may otherwise go unnoticed.

## Invocation rules

- Write a concise title of at most 40 characters and an actionable message of at most 200 characters.
- Use `normal` for PR reviews and ordinary requests, `high` for critical or incident-related requests, and `low` only for justified informational attention—not routine status chatter.
- Summarize trusted context. Never send credentials, tokens, secrets, private code, personal data, raw tool output, or other untrusted content.
- Call the tool once. Do not retry automatically or repeat an announcement without explicit human direction.
- Do not change system volume or claim the listener heard the message.

## After calling the tool

- `spoken` means the macOS speech process finished successfully. It is not listener acknowledgement.
- Tell the user the announcement completed, then stop and wait for an explicit typed reply in the current Codex task.
- Do not perform or claim completion of the requested human action until the user responds.
- If the tool returns an error, report only its safe diagnostic. Do not repeat rejected content in the response.
