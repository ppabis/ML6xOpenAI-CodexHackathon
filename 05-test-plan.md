# 05 Test Plan

## Status and Time Budget

**Status: implementation validation executed on 2026-07-15. Human listener acknowledgement remains pending.**

Testing is capped at 45 minutes of implementation effort plus 30 minutes of integration/manual validation. Person 3 owns automated tests; Person 1 owns manual acceptance and evidence. The goal is critical confidence for **Best Working Product** and honest review evidence for **Best AI-Native Workflow**, not exhaustive coverage.

## Test Environment

- macOS demo machine with Node.js 20+, Codex, `/usr/bin/say`, and active audio.
- Node's built-in test runner and an injected fake process adapter; automated tests must never play audio.
- Fresh plugin installation or clearly disclosed direct project-MCP fallback.
- Synthetic, approved inputs only.

## P0 Automated Tests

| ID | Behavior | Expected result | Covers |
| --- | --- | --- | --- |
| T01 | Valid title/message; urgency omitted | Composes title + message, defaults to `normal`, and maps exit 0 to `spoken` | AC2 |
| T02 | Empty fields, invalid urgency, title 41, or message 201 characters | `INVALID_INPUT`; process is not called | AC3 |
| T03 | One control-character and known-sensitive fixture set | Safe rejection with no process call or payload echo | AC4 |
| T04 | Quotes, semicolons, `$()`, and other benign metacharacters | One literal process argument; fixed executable; shell disabled | AC5 |
| T05 | Missing `say` and non-zero exit | Distinct `TTS_UNAVAILABLE` / `TTS_FAILED`; no false success | AC6 |
| T06 | Any failure result | Contains no title, message, or composed speech | AC4–AC6 |
| T07 | MCP contract | Exactly one `notify_user` tool with the agreed input/result shape | AC1–AC2 |

If time remains before 1:45, add exact 40/200 boundary success cases. Timeout, cancellation, duplicate suppression, and broad pattern tests are deferred.

## P0 Manual Checks

- [x] **V01 — Discovery:** Repo marketplace installed; Codex lists the plugin as installed/enabled; the installed cached MCP server returns exactly `notify_user`; a fresh Codex session discovered and started `voice-notification/notify_user`.
- [x] **V02 — Real process path:** A full installed-cache MCP `tools/call` ran the approved synthetic PR-review request and returned `spoken` after `/usr/bin/say` exited 0. A fresh noninteractive Codex call reached the tool but was cancelled at its user-approval gate. Interactive approval and listener audibility remain human checks.
- [x] **V03 — No-audio rejection:** 201- and 301-character messages return `INVALID_INPUT`; the synthetic password fixture returns `SENSITIVE_CONTENT`; no speech runner is called.
- [x] **V04 — Unavailable TTS:** An injected ENOENT-equivalent runner returns payload-free `TTS_UNAVAILABLE` without changing system files or production configuration.
- [ ] **V05 — Human repeatability:** An independent clean-room agent reproduced prerequisites, installation status, 17 tests, and installed-cache discovery without edits. A human teammate must still open a new task, confirm discovery, and repeat V02.
- [ ] **Acknowledgement:** The plugin skill and MCP instructions require Codex to wait for an explicit typed reply after `spoken`. Confirm this behavior in a new Codex task with a human listener.

## Approved Test Data

- **Title:** `PR review needed`
- **Message:** `Aanchal, pull request 42 is ready. Please review the authentication changes and return to the Codex task when you are finished.`
- **Urgency:** `normal`
- **Sensitive fixture:** one obviously fake token matching a documented deny pattern.
- **Metacharacter fixture:** benign text containing quotes, semicolons, and literal `$()` characters; never a functioning command.

## Evidence Capture

| Evidence | Owner | Destination |
| --- | --- | --- |
| Command, environment, pass/fail count | Person 3 | `06-pr-summary.md` |
| V01–V05 result and limitation | Person 1 | `06-pr-summary.md` |
| Codex-proposed test accepted or changed by humans | Person 1 | `08-codex-workflow-log.md` |
| Live success plus one failure | Team | `07-demo-script.md` |

Do not place spoken payloads in diagnostic logs. Screenshots and recordings may contain only approved synthetic data.

## Executed Results — 2026-07-15

- Environment: macOS, Node.js `v24.10.0`, npm `11.6.0`, Codex CLI `0.144.4`, `/usr/bin/say` present.
- Automated: `npm test` passed 17/17; tests produced no audio.
- Plugin manifest: Plugin Creator validation passed.
- Bundled skill: skill validation passed.
- Installation: after merging `feature/add-voice-notification` and `feature/implementation`, `voice-notification@voice-notification-local` version `0.1.0+codex.20260715095321` reported `installed, enabled`.
- MCP discovery: installed cached server initialized and listed exactly `notify_user`.
- Real tool path: the refreshed installed-cache MCP call announced the merged plugin test and returned `{ ok: true, status: "spoken", urgency: "normal" }` after `say` completed.
- Fresh Codex session: discovered and attempted `voice-notification/notify_user`; noninteractive mode cancelled at the mandatory approval step, so the interactive demo must approve the call.
- Rejections: 201 and 301 characters, synthetic sensitive content, and unavailable TTS returned distinct safe codes without echoing inputs.
- Independent rehearsal: clean-room agent repeated prerequisites, tests, plugin status, and cached discovery without modifying source.

## 2:15 Exit Gate

- T01–T07 pass without real audio. Executed suite: 17/17 passing.
- V01–V04 have technical evidence. V05 and typed listener acknowledgement remain human checks.
- AC1–AC12 have evidence or a named limitation.
- Person 2 reviews shell/process safety; Person 1 reviews privacy, accessibility, and demo claims.

## Known Limitations

- Exit code 0 proves `say` completed, not that the user heard it.
- Pattern matching cannot identify every secret or private fact.
- macOS/audio setup is required; voice does not replace visible text.
- Timeout, cancellation, plugin-managed acknowledgement channels, history, retry, and duplicate suppression are deferred.
- The tool may require interactive approval; unattended notification requires a surface where the user has safely pre-approved this specific tool.

## Review Questions

- Does any path interpret user text as shell syntax or echo it in errors?
- Does success overstate audibility or human completion?
- Which Codex-generated test or safeguard did a human change, and why?
- Is the primary product demo real while fakes remain limited to automated tests?

## Follow-Up Voice Confirmation Tests

- Verify text is the default confirmation mode and the wrapper removes its
  field before calling the core notification handler.
- Verify only explicit allowlisted phrases confirm or decline; ambiguity never
  authorizes progress.
- Verify the Groq request uses the fixed transcription endpoint and exactly
  `whisper-large-v3-turbo`.
- Verify FFmpeg streams 16 kHz mono PCM through a fixed executable and argument
  array with shell execution disabled.
- Verify noise does not trigger onset, 500 ms of pre-roll is retained, five
  seconds without speech ends capture, and continuous speech stops at 30 seconds.
- Verify one ONNX session is reused while recurrent state resets for each
  sequential capture; concurrent capture and shutdown terminate safely.
- Verify temporary audio is deleted on success and failure, with no transcript
  in the tool result.
- Verify missing key, recording failure, provider failure, and unclear speech
  fall back to typed confirmation without real audio or network calls in tests.
