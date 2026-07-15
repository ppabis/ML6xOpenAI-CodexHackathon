---
name: mobile-notification
description: Queue one safe SMS to a consented, Keychain-configured recipient when a Codex task is genuinely blocked on human attention and the user may be away.
---

# Mobile Notification

Use `notify_mobile` only when work cannot safely continue without a person's decision, review, approval, or real-world action.

## Invocation rules

- Write a concise title of at most 40 characters and an actionable message of at most 200 characters.
- Use `normal` for reviews and ordinary decisions, `high` only for critical incidents, and `low` only for justified informational attention.
- Never send credentials, tokens, secrets, private code, personal data, phone numbers, raw tool output, or other untrusted content.
- Call the tool once. Do not retry automatically or repeat a notification without explicit direction.
- Do not use mobile notification for routine progress or completion messages.
- Do not claim a queued SMS was delivered, read, or acknowledged.

## After calling the tool

- `queued` means the provider accepted the request for processing.
- Tell the user only that the SMS was queued, then stop and wait for an explicit typed reply in the current Codex task.
- Do not perform or claim completion of the requested human action until the user responds.
- If the tool returns an error, report only its safe diagnostic. Do not repeat rejected content.
- If mobile notification is not configured, use the existing local `notify_user` tool when available.
