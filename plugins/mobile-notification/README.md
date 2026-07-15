# Mobile Notification Plugin

A companion Codex plugin that exposes one `notify_mobile` MCP tool. It queues a short SMS through Twilio to a single consented recipient configured in macOS Keychain. It does not modify or replace the existing `voice-notification` plugin.

## Safety model

- SMS only; voice calls are deferred.
- The tool accepts no recipient or credential fields.
- Title and message are limited to 40 and 200 characters.
- Sensitive patterns and control characters are rejected before Keychain or network access.
- Credentials and phone numbers are read from macOS Keychain and never returned to Codex.
- Requests are limited to one per minute and five per server process per hour.
- Provider errors are reduced to payload-free structured codes.
- A `queued` result is not proof of delivery, reading, or acknowledgement.

## Prerequisites

- macOS with `/usr/bin/security`
- Node.js 20 or newer
- A Twilio account and SMS-capable sender
- One verified, consented recipient in E.164 format
- A Twilio API key; do not use or store an exposed Auth Token

## Configure macOS Keychain

In **Keychain Access**, create five generic password items. Use account name `twilio` for each item and these item names:

```text
codex-mobile-twilio-account-sid
codex-mobile-twilio-api-key
codex-mobile-twilio-api-secret
codex-mobile-twilio-from-number
codex-mobile-twilio-to-number
```

Put the corresponding value in each item's password field. Never paste values into source files, chat, test fixtures, or shell commands. API key SIDs must begin with `SK` or `RK`; phone numbers must use E.164 format.

## Test without sending SMS

```bash
cd plugins/mobile-notification
npm test
```

All automated tests inject fake Keychain and network adapters. They never access real credentials or contact Twilio.

Run the existing voice regression suite separately:

```bash
cd ../voice-notification
npm test
```

## Install

After the updated marketplace branch is available to Codex:

```bash
codex plugin marketplace upgrade voice-notification-local
codex plugin add mobile-notification@voice-notification-local
```

Start a new Codex task after installation. Keep approval prompting enabled for the first real SMS test.

## Example

```json
{
  "title": "PR review needed",
  "message": "Pull request 42 is ready. Please review it and return to Codex.",
  "channel": "sms",
  "urgency": "normal"
}
```

Expected accepted response:

```json
{
  "ok": true,
  "status": "queued",
  "channel": "sms",
  "urgency": "normal"
}
```

## Limitations

- SMS only; no voice calls, replies, delivery webhooks, durable history, or cross-device acknowledgement.
- Rate limiting is process-local and resets when the MCP server restarts.
- Twilio charges, trial restrictions, geographic permissions, and carrier rules still apply.
- Keychain access may prompt the logged-in macOS user depending on local security settings.
