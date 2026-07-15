# 04 Implementation Plan

## Three-Hour Delivery Goal

At 3:00, the three-person team can demonstrate a real local Codex-to-speaker request, show one validation failure and critical test evidence, explain one human correction to Codex output, and present honest limitations. The plan optimizes for demo readiness, not feature completeness.

## Stack and Scope Decisions

- Node.js 20+ ESM JavaScript; no TypeScript compile step.
- Local STDIO MCP server and fixed `/usr/bin/say` process.
- Node's built-in test runner with an injected fake process adapter.
- One runtime dependency: the MCP SDK required by the generated scaffold.
- No UI, database, cloud API, authentication, background service, persistence, or cross-platform layer.

## Operating Rules

- Planning ends at **0:15**. Person 1 chooses documented defaults if discussion is unresolved.
- M2 plugin work and M3 notification work begin in parallel.
- The first real thin slice is due at **1:00**; dynamic validated input is due at **1:30**.
- Presentation content starts at **1:30**, not after implementation.
- Feature freeze is **2:15**. Only demo-blocking defects may be fixed afterward.
- Update workflow and test evidence at each gate; do not reconstruct it at 2:45.

## Phase 0 — Lock and Preflight (0:00–0:15)

### Person 1

1. Keep Person 1–3 labels and confirm the acknowledgement mechanism; the 40/200 limits, urgency meanings, no-volume rule, and spoken format are already approved.
2. Mark all deferred features out of scope before coding begins.
3. Schedule approval of the synthetic PR-review message and known-sensitive fixture no later than 1:30, before manual validation.

### Persons 2 and 3

1. Verify Codex plugin tooling, Node.js, `/usr/bin/say`, and active audio.
2. Agree on the handler boundary: validated input in, structured result out.

**Gate:** M1 complete. Do not extend planning.

## Phase 1 — Two Parallel Thin Slices (0:15–1:00)

### Person 2: Plugin discovery

1. Scaffold `plugins/voice-notification/`, its required manifest, bundled `.mcp.json`, minimal skill, and repo marketplace entry.
2. Add `package.json` and the smallest JavaScript STDIO server.
3. Register exactly one `notify_user` tool.
4. Route a fixed approved string to a temporary adapter and prove Codex discovery plus real speech.

### Person 3: Safe handler

1. Implement pure validation for required fields, 40/200 limits, urgency enum, control characters, and one small sensitive-pattern set.
2. Compose `<title>. <message>` only after validation.
3. Inject a process runner; the real runner spawns fixed `/usr/bin/say` with an argument array and shell disabled.
4. Map exit 0, missing executable, and non-zero exit to stable payload-free results.

### Person 1: Evidence and demo skeleton

1. Record prompts, decisions, and any corrected Codex output.
2. Prepare manual inputs and draft the opening/problem narrative.

**1:00 gate:** A fixed real announcement must work. Otherwise switch to direct project-scoped MCP configuration and disclose the packaging gap.

## Phase 2 — Integrate and Test (1:00–1:45)

### Persons 2 and 3

1. Replace the fixed string with the safe handler.
2. Verify the approved dynamic message through real `say` by **1:30**.
3. Add critical Node tests for valid input, boundaries, urgency, known-sensitive content, literal shell metacharacters, unavailable command, and non-zero exit.
4. Assert the process runner receives one literal argument, shell is disabled, and error results contain no payload.

### Person 1

1. Draft install, test, privacy, and limitation text using verified details only.
2. Start presentation content at **1:30** and map the live flow to both award categories.

**1:45 gate:** Dynamic happy path and critical automated tests pass. Drop secondary error variants and test expansion if they do not.

## Phase 3 — Validate and Document (1:45–2:15)

1. Person 2 performs the clean install/refresh path and prepares the demo session.
2. Person 3 reviews process safety and fixes only critical defects.
3. Person 1 runs the approved live message, over-limit rejection, sensitive fixture, and controlled unavailable-TTS check.
4. Record actual commands/results in `06-pr-summary.md` and decisions in `08-codex-workflow-log.md`.
5. Remove unfinished code paths and misleading documentation.

**2:15 gate: feature freeze.** AC1–AC12 must have evidence or a named limitation.

## Phase 4 — Presentation and Rehearsal (2:15–3:00)

### 2:15–2:45

- Person 1 finalizes the 3–5 minute narrative and evidence links.
- Person 2 reproduces install/discovery and the live happy path without edits.
- Person 3 reruns critical tests and prepares the safety explanation.
- Team removes any unsupported claim from the PR summary and demo.

### 2:45–3:00

- Rehearsal 1: full timed sequence.
- Fix only presenter wording, ordering, or demo setup.
- Rehearsal 2: final verified sequence.
- Stop editing at 3:00.

## Commands To Establish and Verify

```bash
npm install
npm test
npm start
```

If `npm start` is not part of plugin installation, replace it with the exact verified refresh/start command. Do not add a build or typecheck step unless the scaffold actually requires one.

## Three-Hour Award Gates

- **Best Working Product:** real plugin or disclosed direct-MCP fallback, live `say`, structured result, critical tests, one validation failure, and repeatable demo steps.
- **Best AI-Native Workflow:** artifacts `00`–`08`, real lifecycle entries, one substantive human correction, and a decision linked to code/test impact.
- **Presentation:** problem in 30 seconds, workflow proof in 45 seconds, product and failures in 2 minutes, evidence/limitations in 45 seconds.

## Fallback Triggers

| Deadline | Missing outcome | Immediate cut / fallback |
| --- | --- | --- |
| 0:15 | Product decision unresolved | Person 1 selects documented defaults. |
| 1:00 | Plugin discovery or speech missing | Use direct project MCP configuration; keep real speech and disclose packaging status. |
| 1:30 | Dynamic happy path missing | Pair Persons 2 and 3; cut sensitive-pattern expansion and all secondary errors. |
| 1:45 | Full critical tests missing | Keep happy path, length, shell-argument, and unavailable-command tests; document remaining manual checks. |
| 2:15 | Clean demo path missing | Freeze strongest verified slice; use one live product behavior plus recorded test output, clearly labeled. |
| 2:45 | Presentation incomplete | Cut secondary failure case and future roadmap; retain problem, workflow decision, live success, one failure, and limitation. |

Never cut shell-free execution, length validation, payload-free structured results, privacy instructions, or a final real-audio check. Never start a deferred feature after a gate is missed.

## After The Demo

Timeout/cancellation, duplicate suppression, richer sensitive-content controls, visual notification, voice preferences, plugin-managed acknowledgement channels, and Windows/Linux adapters remain separate follow-up work.
