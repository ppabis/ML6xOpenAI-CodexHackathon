# 05 Test Plan

## Status and Time Budget

**Status: planned; nothing passes until its command and result are recorded.**

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
| T02 | Empty fields, invalid urgency, title 81, or message 301 characters | `INVALID_INPUT`; process is not called | AC3 |
| T03 | One control-character and known-sensitive fixture set | Safe rejection with no process call or payload echo | AC4 |
| T04 | Quotes, semicolons, `$()`, and other benign metacharacters | One literal process argument; fixed executable; shell disabled | AC5 |
| T05 | Missing `say` and non-zero exit | Distinct `TTS_UNAVAILABLE` / `TTS_FAILED`; no false success | AC6 |
| T06 | Any failure result | Contains no title, message, or composed speech | AC4–AC6 |
| T07 | MCP contract | Exactly one `notify_user` tool with the agreed input/result shape | AC1–AC2 |

If time remains before 1:45, add exact 80/300 boundary success cases. Timeout, cancellation, duplicate suppression, and broad pattern tests are deferred.

## P0 Manual Checks

- [ ] **V01 — Discovery:** Follow documented setup and verify Codex exposes exactly `notify_user`, or record use of the direct-MCP fallback.
- [ ] **V02 — Real happy path:** Speak the approved PR-review request, receive `spoken`, and confirm Codex waits.
- [ ] **V03 — No-audio rejection:** Submit a 301-character message and one synthetic sensitive fixture; both fail before speech.
- [ ] **V04 — Unavailable TTS:** Use a safe controlled test path and verify the structured unavailable result without altering system files.
- [ ] **V05 — Repeatability:** A teammate starts a clean/new session and repeats V02 without editing code.

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

## 2:15 Exit Gate

- T01–T07 pass without real audio, or the reduced set T01, T02, T04, and T05 passes with omitted tests documented.
- V01–V03 and V05 pass on the demo machine; V04 has executed evidence or is disclosed as a test-only limitation.
- AC1–AC12 have evidence or a named limitation.
- Person 2 reviews shell/process safety; Person 1 reviews privacy, accessibility, and demo claims.

## Known Limitations

- Exit code 0 proves `say` completed, not that the user heard it.
- Pattern matching cannot identify every secret or private fact.
- macOS/audio setup is required; voice does not replace visible text.
- Timeout, cancellation, acknowledgement, history, retry, and duplicate suppression are deferred.

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
