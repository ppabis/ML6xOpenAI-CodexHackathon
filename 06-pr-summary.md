# 06 PR Summary

## Status

**Pre-implementation evidence template. Replace bracketed fields only with verified results.**

## Intended Outcome

Build a local macOS Codex plugin exposing one `notify_user` action. It should validate a short title/message request, invoke `/usr/bin/say` without a shell, return a structured result, and leave the real-world response to the human.

## Planned Changes

- Repo-local plugin manifest, MCP configuration, and marketplace entry.
- Node.js ESM STDIO MCP server with one tool and no compile step.
- Input validation, sensitive-pattern defense, and safe speech adapter.
- Automated tests with a fake process runner and manual macOS validation.
- Plugin instructions, setup notes, privacy limitations, and demo workflow.

## How To Run

Record commands only after a clean-install rehearsal:

1. **Install:** `[verified command]`
2. **Start or refresh plugin:** `[verified command and restart requirement]`
3. **Invoke from Codex:** `[verified prompt or action]`

## How To Test

```bash
# Replace with commands verified on the implementation branch.
npm install
npm test
npm start
```

- **Automated result:** `[date, environment, passed/failed count, command]`
- **Manual result:** `[V01–V05 status and tester]`
- **Clean-install result:** `[machine/session and outcome]`

## Acceptance Evidence

| Criteria | Status | Evidence |
| --- | --- | --- |
| AC1–AC2: install, discovery, and success | Not run | `[link/output]` |
| AC3–AC6: validation, safety, and failures | Not run | `[test IDs/output]` |
| AC7–AC10: tests, live audio, waiting, docs | Not run | `[test/manual evidence]` |
| AC11–AC12: AI-native workflow and traceability | In progress | `08-codex-workflow-log.md` and `[demo evidence]` |

Never change `Not run` to `Pass` based on generated code, a plan, or expected behavior.

## AI-Native Workflow Evidence

- **Lifecycle use:** `00-product-brief.md` through `08-codex-workflow-log.md`.
- **Human decisions:** `[decision, options considered, owner, impact]`
- **Codex output changed/rejected:** `[output, reason, resulting improvement]`
- **Review contribution:** `[test, security, or scope issue Codex surfaced and human disposition]`

## Known Limitations

- macOS and local `say` only.
- Process success cannot prove the audio was audible or understood.
- Sensitive-pattern checks are incomplete and do not replace caller judgment.
- No voice reply, acknowledgement, persistent history, automatic retry, or cross-device delivery.
- Spoken notifications can be overheard and are not a replacement for visible text.

## Human Review Checklist

- [ ] Person 1 confirms scope, spoken wording, test evidence, and presentation claims.
- [ ] Person 2 verifies plugin/MCP configuration and clean installation.
- [ ] Person 3 verifies failure mappings and automated test results.
- [ ] Security review confirms fixed executable, argument array, and shell disabled.
- [ ] Privacy review confirms approved demo data and no payload logging.
- [ ] Demo claims match executed evidence and disclose limitations.

## Award Readiness

- **Best Working Product:** real plugin path, live audio, tests, and failures are verified—not mocked in the primary demo.
- **Best AI-Native Workflow:** the log shows Codex across the lifecycle plus concrete human correction and review.

All evidence must be ready by the 2:15 feature freeze or explicitly marked as a limitation before the 2:45 presentation cutoff.

## Follow-Up Work

After the hackathon, evaluate duplicate cooldown, cancellation, visual notifications, voice/rate preferences, Windows/Linux adapters, and acknowledgement channels. Each requires a separate privacy and reliability review.
