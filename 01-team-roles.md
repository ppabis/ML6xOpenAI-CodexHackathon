# 01 Team Roles

## Three-Person Team Model

The team has three hours from planning to demo readiness. Each person owns one parallel workstream; documentation and evidence are produced alongside implementation, not afterward.

| Role | Owner | Responsibilities | Three-hour deliverables |
| --- | --- | --- | --- |
| Product, Quality, and Demo Lead | Person 1 | Lock scope and wording, maintain acceptance evidence, run manual validation, update the workflow log, and prepare/rehearse the presentation. | Confirmed contract, test evidence, PR summary, demo script |
| Tech Lead and Plugin Integrator | Person 2 | Scaffold the manifest/marketplace/MCP server, prove Codex discovery, integrate the tool, and own the demo machine setup. | Installable plugin and real Codex-to-tool path |
| TTS and Safety Developer | Person 3 | Implement validation, shell-free `say` execution, structured results, and critical automated tests. | Safe `notify_user` behavior and test suite |

Replace `Person 1`–`Person 3` with names immediately. Codex assists all workstreams but is never the accountable owner.

## Decision and Review Boundaries

- **Person 1 decides:** final limits, demo wording, scope cuts, test sufficiency, and which claims are presentation-ready.
- **Person 2 decides:** plugin/MCP layout, installation commands, and integration fixes.
- **Person 3 decides:** validation and process-adapter implementation, subject to Person 2's security review.
- **Cross-review:** Person 2 reviews shell/process safety; Person 3 reviews MCP integration assumptions; Person 1 validates observable behavior and privacy language.
- **Stop-ship issues:** shell interpolation, sensitive demo data, false success, no repeatable happy path, or claims without evidence.

## Parallel Workstreams

### A — Product, Evidence, and Presentation (Person 1)

- **0:00–0:15:** confirm the contract and three-hour scope.
- Create test fixtures and the blocking PR-review scenario.
- Keep `06-pr-summary.md` and `08-codex-workflow-log.md current at each gate.
- From **1:30**, prepare slides/talking points and the demo sequence while validation continues.
- At **2:15**, lead feature freeze, manual tests, and two short rehearsals.

### B — Plugin and Codex Integration (Person 2)

- Scaffold `.codex-plugin/plugin.json`, `.mcp.json`, the skill, and repo marketplace entry.
- Expose exactly one local STDIO MCP tool.
- Prove Codex discovery and one fixed real announcement by **1:00**.
- Integrate Person 3's validated handler, document install steps, and own the live demo setup.

### C — Core TTS, Safety, and Tests (Person 3)

- Implement bounded input validation and safe result codes.
- Spawn fixed `/usr/bin/say` with an argument array and shell disabled.
- Add only critical automated tests: happy path, boundaries, known-sensitive fixture, literal metacharacters, and unavailable/non-zero speech.
- Deliver the handler interface to Person 2 by **1:00** and finish tests by **1:45**.

## Hard Checkpoints

| Time | Required outcome | If missing |
| --- | --- | --- |
| 0:15 | Contract, owners, stack, and demo message locked | Product Lead chooses the documented defaults; no further option analysis. |
| 1:00 | Codex discovers the tool and a fixed real announcement plays | Switch immediately to direct project-scoped MCP configuration; disclose plugin-packaging gap. |
| 1:30 | Validated dynamic message works end to end | Drop sensitive-pattern expansion and all nonessential error variants. |
| 2:15 | Feature freeze; critical tests and live happy path pass | Demonstrate the strongest verified slice; no new features. |
| 2:45 | PR evidence and demo narrative complete | Cut secondary failure demo; preserve happy path, one validation failure, and workflow evidence. |
| 3:00 | Demo rehearsed and ready | Stop edits and use the last verified sequence. |

## Award Evidence Ownership

| Evidence | Owner | Minimum proof |
| --- | --- | --- |
| Best Working Product | Persons 2 and 3 | Real install/discovery, audible success, structured result, critical automated tests, one validation failure |
| Best AI-Native Workflow | Person 1 | Artifacts `00`–`08`, lifecycle log, one human correction to Codex output, and decision-to-product trace |
| Presentation credibility | Person 1 with team review | Claims match `06-pr-summary.md`; limitations are explicit |

## Codex Usage Pattern

- Person 1 uses Codex to compress decisions, maintain evidence, and challenge claims.
- Person 2 uses Codex for plugin scaffolding and integration diagnostics.
- Person 3 uses Codex for small implementation units, adversarial tests, and security review.
- Every accepted, changed, or rejected material Codex output is logged briefly at the next checkpoint.
