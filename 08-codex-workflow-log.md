# 08 Codex Workflow Log

## Purpose and Evidence Standard

This log supports **Best AI-Native Workflow** by showing where Codex contributed, where humans exercised judgment, and how those decisions affected the working product. Record actual events throughout the day. Do not backfill invented prompts, decisions, implementation, or test results.

For every meaningful entry, capture:

```text
Stage | Prompt/task | Codex output | Human disposition | Reason | Product impact | Evidence
```

## Lifecycle Status

| Stage | Codex contribution | Human responsibility | Status / evidence |
| --- | --- | --- | --- |
| Scoping | Converted the initial voice-notification concept into a bounded product brief with exclusions, safety rules, and success criteria. | Supplied the problem, target users, macOS direction, demo message, and out-of-scope boundaries. | Complete: `00-product-brief.md` |
| Roles and planning | Initially proposed a longer four-role plan, then compressed it to three owners, M1–M8, hard gates, and three-hour fallback cuts after human correction. | Retained Person 1–3 labels, enforced the cut list, and proceeded to implementation. | Complete: `01-team-roles.md`, `02-task-breakdown.md` |
| Architecture | Checked current Codex plugin guidance; initially proposed TypeScript, then changed to build-free ESM JavaScript for the human-imposed three-hour constraint. | Verified configuration, dependency-free runtime, and reduced safety scope during integration. | Implemented: `03-architecture.md`, `plugins/voice-notification/` |
| Implementation | Scaffolded the plugin/marketplace, implemented a dependency-free MCP server, validator, safe `say` adapter, skill instructions, and README using parallel specialist agents. | Person 2 integrated/reviewed outputs and retained payload-free, shell-free boundaries. | Complete: `plugins/voice-notification/` |
| Testing and review | Implemented 17 automated tests, plugin/skill validation, real installed-cache MCP audio call, safe failure simulations, fresh-session discovery, and independent clean-room rehearsal. | Humans must approve the interactive call and confirm audibility, typed acknowledgement, repeatability, and final claims. | Technical checks pass: `05-test-plan.md` |
| Demo preparation | Updated PR/test evidence and installed the repo marketplace/plugin. | Human teammate repeats the live demo and signs off presentation evidence. | In progress: `06-pr-summary.md`, `07-demo-script.md` |

## Prompt / Task Record

### E01 — Product brief

- **Human task:** Define the Codex Voice Notification Plugin problem, users, smallest useful version, scope, demo, and requested Codex support.
- **Codex output:** Structured the input into `00-product-brief.md`, adding measurable success criteria, feasibility cuts, risks, and open decisions.
- **Human disposition:** Accepted and requested it be pushed to the feature branch.
- **Product impact:** Established macOS-only local speech, safety boundaries, and a demoable end-to-end slice.
- **Evidence:** Commit `378afe1` and `00-product-brief.md`.

### E02 — Delivery planning

- **Human task:** Use the brief to define the problem, assumptions, roles, must-have/nice-to-have tasks, acceptance criteria, architecture, stack, risks, and implementation plan.
- **Codex output:** Produced aligned artifacts `01`–`04`, including planning defaults and fallback thresholds.
- **Human disposition:** Accepted and requested the changes be pushed.
- **Product impact:** Chose a minimal local STDIO MCP architecture and protected the safe thin slice from nice-to-have scope.
- **Evidence:** Commit `d66bfa1` and `01-team-roles.md`–`04-implementation-plan.md`.

### E03 — Award-category audit

- **Human task:** Ensure the plan and required Markdown support Best AI-Native Workflow and Best Working Product.
- **Codex output:** Audited `00`–`08`, added category-specific evidence gates, completed the test plan, and created honest PR/demo/workflow templates.
- **Human disposition:** Accepted by continuing into implementation with both award evidence tracks.
- **Product impact:** Prevents plans from being presented as implementation proof and makes workflow evidence a continuous must-have task.
- **Evidence:** Current working-tree changes.

### E04 — Three-person, three-hour correction

- **Human task:** Replan for a three-person team that must finish planning, implementation, presentation preparation, and rehearsal in three hours.
- **Codex output:** Replaced the longer four-role schedule with three combined owners, a 15-minute planning cap, parallel plugin/handler work, a 1:00 thin-slice gate, a 2:15 feature freeze, and a 3:00 stop.
- **Human disposition:** Changed and accepted the earlier plan by imposing the three-person, three-hour constraint and starting implementation from it.
- **Product impact:** Switched TypeScript to build-free ESM JavaScript, reduced M1–M11 to M1–M8, deferred timeout/cancellation and broad testing, and started presentation work at 1:30.
- **Evidence:** Current changes to `01-team-roles.md`–`05-test-plan.md`.

### E05 — Person 1 interface decisions

- **Human task:** Keep Person 1–3 labels; reduce title/message limits; define urgency use; preserve system volume; confirm spoken composition; request listener acknowledgement; defer demo-message, fixture, and final cut-list approval.
- **Codex output:** Propagated confirmed limits and urgency semantics through the brief, task contract, architecture, implementation plan, and tests. Separated `say` process completion from listener acknowledgement and recommended a typed task reply.
- **Human disposition:** Confirmed 40-character titles, 200-character messages, `low` for informational attention, `normal` for PR reviews/ordinary requests, `high` for critical/incidents, no volume effect, and `<title>. <message>` composition. Chose to retain role placeholders.
- **Product impact:** Shorter spoken content and explicit urgency meanings are testable; the implemented skill now requires typed acknowledgement after `spoken` without adding another input channel.
- **Evidence:** Current changes to `00-product-brief.md`–`08-codex-workflow-log.md`.

### E06 — Person 2 implementation and feature freeze

- **Human task:** Implement V01–V05, safe error behavior, listener waiting instructions, evidence recording, and feature freeze in agentic mode.
- **Codex output:** Used the supported Plugin Creator scaffold, delegated MCP and safety/test work, integrated a dependency-free Node ESM MCP server, installed the repo marketplace/plugin, and executed automated, simulated, and real-audio checks.
- **Human disposition:** Person 2 accepted the dependency-free implementation, 40/200 boundary contract, typed-response acknowledgement workflow, and deferred plugin-managed acknowledgement channels.
- **Product impact:** Codex now lists an installed/enabled plugin whose cached server exposes exactly `notify_user`; 17 tests pass; a full installed-cache call returned `spoken`; safe failures do not echo payloads.
- **Discovery finding:** A fresh Codex session discovered and started the plugin tool, but noninteractive mode cancelled at the mandatory approval gate. The live demo must use interactive approval or a safely pre-approved surface.
- **Evidence:** `plugins/voice-notification/`, `.agents/plugins/marketplace.json`, `05-test-plan.md`, and `06-pr-summary.md`.
- **Freeze:** Code feature freeze declared on 2026-07-15 after technical P0 validation. Only human demo verification and documentation corrections remain.

## Human Decisions Confirmed So Far

| Decision | Human rationale / source | Effect |
| --- | --- | --- |
| Target macOS first and use built-in `say` | Explicit brief direction; lowest-risk three-hour path | Removes cloud TTS and cross-platform work from MVP. |
| Speak only short actionable requests | Explicit problem and safety scope | Drives bounded title/message validation and demo wording. |
| Never speak secrets, credentials, private code, or raw untrusted content | Explicit privacy boundary | Requires caller instructions, safe fixtures, no payload logging, and defense-in-depth checks. |
| Keep the real-world action human-owned | Explicit out-of-scope boundary | Codex reports notification status and waits for confirmation. |
| Target two awards | Explicit category choice | Requires both executable product proof and lifecycle/human-judgment evidence. |
| Use three people and be demo-ready in three hours | Explicit team/time constraint | Combines roles, removes compilation, narrows tests, and adds hard stop gates. |
| Keep role labels as Person 1, Person 2, and Person 3 | Explicit Person 1 direction | No names are required in the planning artifacts. |
| Limit titles to 40 and messages to 200 characters | Explicit Person 1 decision | Updates validation boundaries and over-limit tests. |
| Define urgency without volume changes | Explicit Person 1 decision | `low` = informational attention, `normal` = PR review/ordinary, `high` = critical/incident; all use current system volume. |
| Speak title followed by message | Explicit Person 1 decision | Speech composition is `<title>. <message>`. |
| Use typed acknowledgement after `spoken` | Three-hour scoped implementation decision | Codex waits in the current task; no voice/button acknowledgement channel is added. |
| Use dependency-free JSONL MCP | Person 2 accepted specialist-agent recommendation | Removes install/version risk while preserving the required tool contract. |

## Decisions and Checks Still Requiring Human Confirmation

- [x] A fresh Codex session discovered and started `voice-notification/notify_user`.
- [ ] Approve the tool interactively, or configure safe per-tool pre-approval on the chosen demo surface.
- [ ] Confirm the synthetic PR-review message is audible through the intended demo output device.
- [ ] After `spoken`, type an acknowledgement and confirm Codex did not continue before that response.
- [ ] Have a human teammate repeat the documented install/discovery/live path without source edits.
- [ ] Approve the final privacy/accessibility review and demo claims.

## Outputs Changed or Rejected

| Codex output | Human change/rejection | Why | Resulting improvement | Evidence |
| --- | --- | --- | --- | --- |
| Four-role, roughly 5.5-hour TypeScript delivery plan | Human specified three people and a three-hour end-to-end deadline | Original plan could not finish implementation and presentation within the available window | Three combined owners, build-free JavaScript, hard gates, reduced P0 tests, and 2:15 freeze | E04 and current planning diff |
| Proposed 80-character title and 300-character message limits | Human reduced limits to 40 and 200 | Shorter announcements are more appropriate for voice and the compressed demo scope | Tighter validation contract and updated boundary tests | E05 and current planning diff |
| Initial architecture expected an MCP SDK dependency | Person 2 accepted the agent recommendation for dependency-free JSONL MCP | Avoid package/network/version risk in the three-hour window | Zero runtime packages, direct Node start, and 17 passing tests | E06 and plugin implementation |

A cosmetic wording edit is weak evidence. Prefer a real scope, interface, security, architecture, or test decision.

## Checkpoint Log To Complete

| Checkpoint | What to record |
| --- | --- |
| 0:15 contract gate | Options Codex proposed, human selection, and rationale |
| 1:00 thin-slice gate | Files generated, integration issue encountered, and human correction |
| 1:30 integration gate | Features retained/cut and why |
| 1:45–2:15 security/test review | Codex finding, human assessment, and code/test change |
| 2:15 feature freeze | Executed evidence, remaining gaps, and honest demo claims |
| 2:45 rehearsal | Confusing step found and how the team simplified it |

## Final Reflection Prompts

- Where did Codex shorten the path from ambiguity to evidence?
- Which Codex recommendation was wrong, excessive, or unsafe until a human changed it?
- Which human decision most improved the working product?
- What evidence shows Codex supported the lifecycle rather than only code generation?
- What would the team change in its next AI-native delivery workflow?
