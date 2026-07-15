# 02 Task Breakdown

## Problem and Working Assumptions

Codex tasks can remain blocked because requests for human intervention are easy to miss away from the Codex window. The MVP must make one short, actionable request audible and report whether local speech completed successfully.

Planning defaults, subject to Product Owner confirmation before coding:

- macOS with `say`, Node.js 20+, and an active default audio device;
- title limit: 80 characters; message limit: 300 characters;
- urgency: `low`, `normal`, or `high`, defaulting to `normal`, with no volume change;
- the spoken text is `title` followed by `message`;
- the call waits for `say` to exit; no automatic retry or persistent history;
- content checks catch known risky patterns but cannot guarantee secret detection.

## Must-Have Tasks

- [ ] **M1 — Confirm contract:** approve limits, urgency values, spoken composition, and blocking behavior.
- [ ] **M2 — Scaffold plugin:** add the required manifest, bundled MCP configuration, and repo-local marketplace entry.
- [ ] **M3 — Expose tool:** register `notify_user(title, message, urgency?)` through a local STDIO MCP server.
- [ ] **M4 — Validate input:** reject missing, empty, over-limit, invalid-urgency, control-character, and known-sensitive-pattern inputs.
- [ ] **M5 — Execute speech safely:** verify `say` exists and spawn it with an argument array and shell execution disabled.
- [ ] **M6 — Return structured results:** distinguish validation, unavailable-command, execution, timeout, and success outcomes without echoing sensitive text.
- [ ] **M7 — Add automated tests:** cover schema boundaries, sensitive fixtures, safe process arguments, exit failures, and timeouts with no real audio.
- [ ] **M8 — Run manual tests:** verify audible success on macOS plus over-limit and unavailable-TTS failures.
- [ ] **M9 — Write plugin instructions:** define appropriate use, no retries, no secrets/raw output, and the requirement to await the human.
- [ ] **M10 — Document and rehearse:** provide install/run/test steps and a repeatable demo scenario.

## Nice-To-Have Tasks

- [ ] **N1 — Duplicate cooldown:** reject identical requests repeated within 60 seconds in the same server process.
- [ ] **N2 — Cancellation:** stop an in-progress child process when the MCP request is cancelled.
- [ ] **N3 — Voice/rate configuration:** allow bounded local preferences without changing the tool contract.
- [ ] **N4 — Accessibility companion:** pair speech with a native visual notification.
- [ ] **N5 — Portability design:** document adapter contracts for Windows and Linux without implementing them.

## Acceptance Criteria

| ID | Criterion |
| --- | --- |
| AC1 | A fresh documented install exposes exactly one action, `notify_user`, to Codex. |
| AC2 | Valid title/message input causes `say` to receive the expected combined text and returns `{ ok: true, status: "spoken" }` only after exit code 0. |
| AC3 | Empty fields, invalid urgency, title over 80 characters, or message over 300 characters return a validation error before process launch. |
| AC4 | Known secret fixtures and disallowed control characters are rejected; instructions explicitly prohibit all sensitive or raw untrusted content. |
| AC5 | User-controlled text is passed as process arguments; no shell, command string interpolation, `eval`, or logged spoken payload is used. |
| AC6 | Missing `say`, non-zero exit, and timeout return distinct safe error codes that Codex can act on. |
| AC7 | Automated tests do not produce audio and pass using the documented command. |
| AC8 | The manual demo audibly plays the approved PR-review message through the active output device. |
| AC9 | Codex reports the announcement result and waits; it does not claim review or approval happened. |
| AC10 | Setup, limitations, privacy warning, manual test, and fallback instructions are reproducible by another teammate. |

## Dependencies

- M2 depends on M1 and current Codex plugin/MCP conventions.
- M3 depends on M2; M4–M6 depend on the M1 contract but can be developed behind interfaces in parallel.
- M7 depends on the validation and process-runner interfaces, not completed plugin installation.
- M8 depends on a macOS host with audible output and M3–M6 integrated.
- M10 depends on verified commands and evidence from M7–M8.

No cloud API, model call, database, account credential, or network service is required at runtime.

## Risks and Mitigations

| Risk | Impact | Mitigation / fallback |
| --- | --- | --- |
| Plugin or marketplace wiring takes too long | Codex cannot call the action | Prove discovery first; fall back to direct local MCP configuration for the demo and document the gap. |
| Audio device is muted or unavailable | False confidence or silent demo | Treat exit success as process success, not proof of audibility; preflight manually and keep a recorded backup only for presentation continuity. |
| Sensitive data is spoken | Privacy incident | Instruction-level prohibition, deterministic risky-pattern checks, no payload logging, and human review of demo text. |
| Shell injection | Local command execution | Use a fixed executable and argument array with shell disabled; test metacharacters as literal text. |
| Notification fatigue | User ignores alerts | Require genuine blocking context, prohibit automatic retries, and defer cooldown to N1. |
| `say` hangs or is interrupted | Tool never resolves | Add a bounded timeout and terminate the child; return a distinct safe error. |

## Parallel Execution and Timeboxes

- **0:00–0:30:** M1, ownership, architecture confirmation.
- **0:30–1:30:** M2–M3 thin slice; in parallel define M4–M7 interfaces and M9 instructions.
- **1:30–3:30:** M4–M7 implementation and integration; documentation starts against verified commands.
- **3:30–4:30:** M8 failure-path and audio validation; fix only must-have defects.
- **4:30–5:30:** M10, PR evidence, privacy review, and two demo rehearsals.

At midday, drop N1–N5. If the integrated happy path is still failing, use the fallback scope in `04-implementation-plan.md`.
