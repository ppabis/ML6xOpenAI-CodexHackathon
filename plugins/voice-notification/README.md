# Voice Notification Plugin

A local macOS Codex plugin that exposes one `notify_user` tool. It validates a short, trusted request, speaks `<title>. <message>` with `/usr/bin/say`, and returns a structured result.

## Requirements

- macOS with `/usr/bin/say`
- Node.js 20 or newer
- Codex with local plugin and MCP support

No cloud service, API key, database, or package download is required.

## Install From This Repository

From the repository root:

```bash
codex plugin marketplace add .
codex plugin add voice-notification@voice-notification-local
```

Restart Codex and open a new task so the installed plugin and its MCP tool are loaded. The logical tool name is `notify_user`; Codex may display a namespaced form.

The first call may require interactive approval because speaking is a side effect. Approve it in the Codex UI for the live demo. Noninteractive `codex exec` sessions cancel approval-gated calls; do not use them as the primary audio demo. If the chosen Codex surface supports persistent per-tool approval, configure it before relying on notifications while away from the window.

Verify the installation with:

```bash
codex plugin list
```

It should show `voice-notification@voice-notification-local` as `installed, enabled`. The automated tests below also start the MCP server and verify that `tools/list` returns exactly `notify_user`.

## Run Tests

```bash
cd plugins/voice-notification
npm test
```

Automated tests use a fake process runner and do not play audio.

## Manual Demo

Ask Codex to call `notify_user` with:

```json
{
  "title": "PR review needed",
  "message": "Aanchal, pull request 42 is ready. Please review it and return to this Codex task when finished.",
  "urgency": "normal"
}
```

A successful result means `say` finished. It does not prove the listener heard or understood the announcement. Codex must wait for an explicit typed response before continuing the blocked task.

## Limits and Safety

- Title: 1–40 characters
- Message: 1–200 characters
- Urgency: `low`, `normal`, or `high`; urgency never changes system volume
- Known sensitive patterns and control characters are rejected, but detection is not comprehensive
- User text is passed as one process argument with shell execution disabled
- Errors do not echo the title, message, speech text, stdout, or stderr
- macOS only; no timeout, cancellation, cooldown, history, voice reply, or plugin-managed acknowledgement
- Tool invocation may require interactive approval unless the Codex surface has been configured to pre-approve it

## Development Refresh

Installed local plugins run from a cache. After changing the plugin, ask Codex:

```text
$plugin-creator update the existing plugins/voice-notification plugin using the cachebuster and reinstall flow.
```

Then open a new Codex task so the refreshed skill and tool are loaded.
