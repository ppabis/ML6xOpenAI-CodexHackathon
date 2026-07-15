# 04 Implementation Plan

## Delivery Goal

By feature freeze, a teammate can install the repo-local plugin, ask Codex to call `notify_user`, hear one approved message on macOS, and observe safe structured success or failure. Implementation begins only after the Product Owner confirms the planning defaults in `02-task-breakdown.md`.

## Stack and Setup Decisions

- Node.js 20+, TypeScript strict mode, local STDIO MCP, and `/usr/bin/say`.
- Use the supported plugin scaffolding workflow to generate the manifest and repo marketplace entry.
- Keep runtime local and storage-free; add no web UI, database, cloud API, or background service.
- Prefer Node's test runner and standard child-process APIs; add only the MCP SDK and TypeScript tooling required to build.

## Phase 0 — Confirm and Preflight (0:00–0:30)

1. Assign owners from `01-team-roles.md`.
2. Product Owner confirms title/message limits, urgency values, title composition, blocking behavior, and nice-to-have exclusions.
3. Verify `node`, the package manager, `/usr/bin/say`, Codex plugin tooling, and an audible macOS output device.
4. Record exact versions and commands in the plugin README.
5. Tech Lead publishes the final tool input/result contract; Quality Owner publishes the test fixtures.

**Exit:** M1 is closed and no must-have depends on an unresolved product decision.

## Phase 1 — Scaffold and First Thin Slice (0:30–1:30)

1. Scaffold `plugins/voice-notification/` with `.codex-plugin/plugin.json`.
2. Add the bundled `.mcp.json`, minimal skill instructions, and `.agents/plugins/marketplace.json` entry.
3. Create the TypeScript build/test configuration and lockfile.
4. Register one `notify_user` MCP tool with the agreed schema.
5. Temporarily route one fixed safe string through the speech adapter.
6. Build, install/refresh the local plugin, call it from Codex, and capture the first result.

**Exit:** Codex discovers one tool and a fixed announcement reaches `say`. If discovery fails, stop feature work and use the integration fallback below.

## Phase 2 — Core Behavior in Parallel (1:30–3:00)

### Plugin Integrator

- Replace the fixed input with the validated tool request.
- Map MCP success/error content to the stable response contract.
- Verify clean startup, shutdown, and one call at a time.

### TTS Owner

- Implement pure validation and speech-composition functions first.
- Add the injected process-runner interface.
- Launch only fixed `/usr/bin/say`, pass an argument array, disable shell execution, enforce timeout, and map exit/error events.
- Avoid logging title, message, or composed speech.

### Quality and Demo Owner

- Write unit tests for boundaries and known-sensitive fixtures.
- Test metacharacters as literal input and assert no shell path exists.
- Draft install, privacy, troubleshooting, and demo documentation using verified commands only.

**Exit:** M3–M7 pass locally with fake processes; the real happy path works once.

## Phase 3 — Integration and Validation (3:00–4:30)

1. Run formatting, type checks, unit tests, and build from a clean checkout or fresh install.
2. Execute the acceptance matrix AC1–AC10 and record evidence in `06-pr-summary.md`.
3. Manually verify the approved PR-review message through active audio output.
4. Demonstrate over-limit rejection before process launch.
5. Simulate unavailable `say`, non-zero exit, and timeout through the adapter tests or controlled test configuration.
6. Review instructions for secret disclosure, raw content, automatic retries, and false acknowledgement.
7. Fix must-have defects only after the 4:00 checkpoint.

**Exit:** AC1–AC10 pass or each gap is explicitly documented with a demo-safe fallback.

## Phase 4 — Feature Freeze and Demo (4:30–5:30)

1. Freeze behavior and remove any unfinished nice-to-have paths.
2. Complete `05-test-plan.md`, `06-pr-summary.md`, `07-demo-script.md`, and `08-codex-workflow-log.md`.
3. Rehearse the happy path, length rejection, unavailable-TTS error, and privacy rule.
4. Run the demo twice from installation/startup steps without editing code.
5. Prepare a silent-room fallback explanation and captured non-sensitive evidence.

## Validation Commands To Establish

The Tech Lead must add and verify equivalent package scripts during scaffolding:

```bash
npm install
npm run build
npm test
npm run typecheck
```

The README must also document the exact local marketplace install/refresh flow and real-audio manual command. Commands are not considered final until executed successfully on the demo machine.

## Human Review Gates

- **Product:** Is every spoken request short, attributable, and actionable?
- **Security:** Can any user text become shell syntax, logs, or an unsafe error?
- **Privacy:** Are known sensitive fixtures rejected without claiming comprehensive detection?
- **Reliability:** Does success mean `say` exited successfully, and are failure codes distinguishable?
- **Accessibility:** Does visible text remain available and does documentation acknowledge audio limitations?
- **Demo:** Can a new session reproduce the flow without code edits?

## Risks, Dependencies, and Fallback Scope

| Trigger | Immediate response | Demo fallback |
| --- | --- | --- |
| Plugin discovery is not working by 1:30 | Stop all nice-to-haves; pair Product Owner with Tech Lead | Configure the same STDIO MCP server directly in trusted project Codex config and disclose that plugin packaging remains incomplete. |
| Real TTS is not working by 3:30 | Verify `/usr/bin/say`, output device, permissions, and fixed-string execution | Demonstrate safe argument construction with a fake runner and show a pre-recorded non-sensitive clip only as presentation backup. |
| Automated tests consume integration time | Keep validation/process unit tests; drop broad contract coverage | Run and record a concise manual matrix for remaining cases. |
| Sensitive-pattern rules create false positives | Keep explicit secret markers and instruction guardrails | Remove speculative patterns; document that callers must provide a safe summary. |
| Timeout/cancellation becomes unstable | Preserve timeout and deterministic cleanup | Drop user-triggered cancellation (N2); return timeout error after the fixed bound. |
| Schedule slips after midday | Freeze M1–M6 and M9 | Cut N1–N5, test only critical boundaries, and use one polished happy path plus two failures. |

Never cut length validation, shell-free execution, safe structured errors, privacy instructions, or the final manual audio check. These are the credibility boundary of the demo.

## Post-Hackathon Path

After the MVP, add in-memory duplicate suppression, cancellation, configurable voice/rate, a visual companion notification, and platform adapters for Windows PowerShell speech and Linux speech tools. Evaluate acknowledgement and richer channels only after defining authentication, privacy, and delivery guarantees.
