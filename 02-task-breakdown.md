# 02 Task Breakdown

## Problem and Locked Planning Defaults

Codex tasks can remain blocked because human requests are easy to miss away from the window. In three hours, the team will prove one safe macOS flow: Codex calls `notify_user`, a short request is spoken through `say`, a structured result returns, and Codex waits for the human.

Use these confirmed decisions and implementation defaults; only acknowledgement remains open at 0:15:

- Node.js 20+ ESM JavaScript, local STDIO MCP, and `/usr/bin/say`;
- title limit 40 characters and message limit 200 characters;
- urgency `low` for informational attention messages, `normal` for PR reviews and ordinary requests, and `high` for critical/incidents; default `normal`, with no volume effect;
- speak `<title>. <message>` and wait for `say` to exit;
- after speech, Codex waits for listener acknowledgement; the mechanism is pending, with an explicit typed reply in the Codex task recommended for the three-hour MVP;
- no automatic retry, persistence, plugin-managed acknowledgement channel, or cooldown;
- a small known-sensitive-pattern check supplements, but does not replace, caller judgment.

## Must-Have Tasks

- [ ] **M1 — Lock the contract (0:00–0:15):** retain Person 1–3 labels, choose the listener-acknowledgement mechanism, and confirm the deferred-feature cut list.
- [ ] **M2 — Prove plugin discovery (0:15–1:00):** scaffold manifest, MCP configuration, skill instructions, marketplace entry, and one fixed real announcement.
- [ ] **M3 — Implement safe notification (0:15–1:15):** validate inputs, compose speech, spawn fixed `say` without a shell, and return success/validation/unavailable/execution results.
- [ ] **M4 — Integrate dynamic tool (1:00–1:30):** connect `notify_user(title, message, urgency?)` to M3 and verify the approved message end to end.
- [ ] **M5 — Add critical automated tests (1:00–1:45):** cover valid input, length/urgency boundaries, one known-sensitive fixture, literal metacharacters, missing `say`, and non-zero exit without playing audio.
- [ ] **M6 — Validate and document (1:30–2:15):** run build-free checks/tests, live audio, over-limit rejection, install steps, privacy limits, and one controlled unavailable-TTS result.
- [ ] **M7 — Capture AI-native evidence (throughout):** log material Codex prompts, human decisions, and at least one changed/rejected output with product impact.
- [ ] **M8 — Freeze and rehearse (2:15–3:00):** finish PR evidence, prepare the 3–5 minute story, and rehearse the verified sequence twice.

## Explicitly Deferred

- Timeout/cancellation support beyond basic child-process error handling.
- Duplicate cooldown, retry scheduling, notification history, or a plugin-managed acknowledgement UI/channel.
- Configurable voice/rate, visual notification, Windows, or Linux.
- Broad secret detection, exhaustive contract tests, polished assets, and recorded backup unless time remains after rehearsal.

Do not start deferred work during the three-hour window.

## Acceptance Criteria

| ID | Criterion |
| --- | --- |
| AC1 | A documented local setup exposes exactly one `notify_user` action to Codex, or the direct MCP fallback is clearly disclosed. |
| AC2 | Valid input plays `<title>. <message>` through real `/usr/bin/say` and returns `spoken` only after exit code 0. |
| AC3 | Empty, invalid-urgency, title-over-40, and message-over-200 inputs fail before process launch. |
| AC4 | One synthetic known-sensitive fixture is rejected and instructions prohibit all sensitive/raw untrusted content without claiming complete detection. |
| AC5 | User text is one process argument; shell execution, interpolation, payload logging, and `eval` are absent. |
| AC6 | Missing `say` and non-zero exit return distinguishable safe failures with no payload echo. |
| AC7 | Critical automated tests pass without producing audio. |
| AC8 | The approved PR-review message is heard on the demo machine and Codex waits for explicit listener confirmation through the agreed acknowledgement mechanism. |
| AC9 | Install, test, limitation, and demo steps are reproducible without code edits. |
| AC10 | The workflow log spans brief, planning, implementation/review, testing, and demo preparation with one substantive human correction. |
| AC11 | The final presentation connects a human-approved decision to implementation and test evidence. |
| AC12 | Every product claim is marked planned, implemented, tested, or demo-verified; gaps are disclosed. |

## Critical Dependencies

- M2 and M3 start after M1 and run in parallel.
- M4 needs the tool shell from M2 and handler contract from M3.
- M5 starts against M3's pure interfaces; it does not wait for plugin installation.
- M6 needs M4 plus critical M5 results.
- M7 runs continuously; M8 uses evidence from M6–M7.

Runtime requires no cloud API, database, model call, account credential, or network service.

## Three-Hour Schedule

| Time | Person 1: Product/QA/Demo | Person 2: Plugin/Integration | Person 3: TTS/Safety/Tests |
| --- | --- | --- | --- |
| 0:00–0:15 | Lock decisions and fixtures | Preflight Codex/plugin tooling | Preflight Node and `say` |
| 0:15–1:00 | Maintain evidence; draft demo story | Scaffold and fixed thin slice | Handler, validation, process adapter |
| 1:00–1:30 | Prepare manual checks and docs | Integrate dynamic tool | Critical tests and integration support |
| 1:30–1:45 | Start presentation content | Fix integration only | Finish critical tests |
| 1:45–2:15 | Run manual acceptance and capture evidence | Clean install/demo setup | Fix critical defects and review safety |
| 2:15–2:45 | Freeze, finish PR summary/demo script | Reproduce live path | Confirm tests and limitations |
| 2:45–3:00 | Lead two concise rehearsals | Run product steps | Present quality/safety evidence |

## Fallback Priority

1. Preserve real speech, length validation, shell-free execution, one structured failure, and the live demo.
2. Preserve one critical automated test group and honest workflow evidence.
3. Use direct MCP configuration if marketplace/plugin discovery blocks the product.
4. Cut secondary errors, broad sensitive patterns, extra documentation polish, and backup recording.
5. Never trade a verified happy path for a wider but unfinished feature set.
