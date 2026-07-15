# 01 Team Roles

## Team Model

Plan for four people. With three people, combine Product/Demo ownership and keep Quality independent from the primary implementation review.

| Role | Owner | Responsibilities | Primary deliverables |
| --- | --- | --- | --- |
| Delivery Lead / Product Owner | Person 1 | Protect the one-day scope, resolve interface decisions, track dependencies, and run checkpoints. | Updated planning artifacts, decision log, scope cuts |
| Tech Lead / Plugin Integrator | Person 2 | Own the Codex plugin manifest, local marketplace wiring, MCP integration, and final merge. | Installable plugin scaffold and working end-to-end slice |
| Developer / TTS Owner | Person 3 | Implement validation, safe process execution, structured results, and focused unit tests. | `notify_user` tool and macOS `say` adapter |
| Quality, Privacy, and Demo Owner | Person 4 | Challenge safety claims, own failure-path testing, document setup, and rehearse the demo. | Test evidence, risk review, PR summary, demo script |

Names should replace `Person 1`–`Person 4` before implementation starts. Every deliverable has one accountable owner even when another person contributes.

## Responsibility Boundaries

- **Product Owner decides:** maximum lengths, urgency semantics, cooldown scope, and any midday cuts.
- **Tech Lead decides:** plugin layout, MCP transport details, build commands, and integration fixes.
- **TTS Owner decides:** internal module boundaries and process-adapter design, subject to security review.
- **Quality Owner can block the demo:** shell interpolation, secret exposure, misleading success, or undocumented setup failure.
- **All humans review:** spoken wording, privacy implications, accessibility limitations, and whether the request is genuinely actionable.

## Parallel Workstreams

### A — Plugin and Integration (Person 2)

- Scaffold `.codex-plugin/plugin.json`, `.mcp.json`, and the repo marketplace entry.
- Expose a local STDIO MCP tool named `notify_user`.
- Prove one hard-coded end-to-end announcement early.

### B — Core Behavior and Safety (Person 3)

- Define schemas, limits, safe error codes, and sensitive-content fixtures.
- Implement the TTS adapter using argument-based process spawning with no shell.
- Add unit tests with a fake process runner.

### C — Quality, Documentation, and Demo (Person 4)

- Build the manual test matrix and privacy/accessibility review.
- Write installation, troubleshooting, and demo steps.
- Capture success and failure evidence without recording sensitive content.

### D — Coordination and Story (Person 1)

- Keep task status and decisions current.
- Prepare the blocking-task scenario and user-facing wording.
- Own the midday go/no-go decision on nice-to-haves.

## Handoffs and Checkpoints

- **After 30 minutes:** Product Owner confirms defaults; Tech Lead publishes the tool contract and file layout.
- **After 90 minutes:** Workstream A demonstrates a hard-coded thin slice; Workstream B supplies validation and process interfaces.
- **Midday:** Integrate, run the happy path, and cut all nice-to-haves if it is not reliable.
- **Final 90 minutes:** Freeze features, execute the test matrix, update `06-pr-summary.md`, and rehearse `07-demo-script.md` twice.

## How Codex Supports the Team

- Product: compare decisions, expose scope creep, and maintain artifacts.
- Architecture: verify plugin conventions and review the data flow.
- Development: generate small reviewable units only after interfaces are agreed.
- Quality: propose adversarial inputs, tests, and privacy checks.
- Demo: refine the narrative and record where Codex assisted.
