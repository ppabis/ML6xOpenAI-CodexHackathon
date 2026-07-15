---
name: voice-notification
description: Speak a short local macOS notification when a Codex task is genuinely blocked on a person's real-world action or decision and the person may be away from the computer. Use only for a necessary human handoff, never as a routine completion alert or status update.
---

# Voice notification

Use `notify_user` only when work cannot continue without a person's real-world action or decision.

## Prepare the request

- Write a short, trusted summary: a title of at most 80 characters and a message of at most 300 characters.
- State what needs attention and what the person should do next.
- Never include credentials, secrets, tokens, private code, personal data, or raw tool output.
- Treat `urgency` as metadata only. Use `normal` unless the situation clearly warrants `low` or `high`; do not imply it changes volume or interrupts other audio.

## Notify and wait

1. Call `notify_user` once with the prepared title, message, and optional urgency.
2. Report the structured result without repeating sensitive input.
3. If the result is `spoken`, say only that speech completed. Do not claim the person heard it or completed the requested action.
4. If the call fails, report the safe error. Do not retry automatically.
5. Wait for explicit human confirmation before treating the real-world action as complete or continuing blocked work.

The tool has no acknowledgement, notification history, timeout, or delivery guarantee. Spoken audio may be muted, routed to another device, or overheard.
