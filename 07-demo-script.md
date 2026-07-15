# 07 Demo Script

## Demo Goal

In 3–5 minutes, prove both target categories with one connected story:

1. Codex and humans used an explicit workflow to scope and review the product.
2. The resulting plugin performs a real, safe, local voice notification.

Do not claim a behavior until its evidence is recorded in `06-pr-summary.md`.

## Pre-Demo Checklist

- [ ] Plugin installed and enabled in a fresh Codex session, or direct-MCP fallback clearly documented.
- [ ] Active speakers/headphones checked at a suitable volume.
- [ ] Approved synthetic PR-review message ready.
- [ ] Automated test summary and one safe failure example ready.
- [ ] No credentials, private code, personal data, or real customer content visible.
- [ ] Backup evidence prepared, but not substituted for the primary live path.

## 0:00–0:30 — Problem and Scope

**Presenter:** “Long-running Codex tasks can pause for human review while the user is away from the window. We built one focused macOS action that speaks a short request, reports whether local speech completed, and then leaves the decision with the human.”

Show the three-hour scope and exclusions. Emphasize three people, local `say`, no cloud service, no voice replies, and no autonomous completion of the human task.

## 0:30–1:15 — Best AI-Native Workflow Evidence

Show the traceable artifact chain:

```text
brief -> roles -> tasks/acceptance -> architecture -> implementation
      -> tests/review -> PR evidence -> demo -> workflow log
```

**Presenter:** “Codex supported every lifecycle stage, not only code generation. Humans retained the decisions that matter: scope, privacy boundaries, urgency behavior, test sufficiency, and what not to build.”

Show one specific Codex output that a human changed or rejected and explain the resulting product improvement. Use only the completed entry from `08-codex-workflow-log.md`; do not improvise one.

## 1:15–2:30 — Best Working Product: Live Happy Path

1. Show a simulated Codex task blocked on PR review.
2. Ask Codex to use `notify_user` with:
   - title: `PR review needed`
   - message: `Aanchal, pull request 42 is ready. Please review the authentication changes and return to the Codex task when you are finished.`
   - urgency: `normal`
3. Let the audience hear the real macOS announcement.
4. Show the structured `spoken` result.
5. Show that Codex waits and does not claim the review happened.

**Presenter:** “This is the actual plugin and local MCP path—not a prerecorded primary demo and not cloud text-to-speech.” If the direct-MCP fallback was required, replace this sentence with an explicit packaging-status disclosure.

Say that sentence only if V01, V02, and V05 passed.

## 2:30–3:20 — Safety and Failure Evidence

Demonstrate two concise cases:

1. Submit a 301-character message and show validation rejects it before audio.
2. Show the controlled unavailable-TTS case returning `TTS_UNAVAILABLE`, or show its executed automated evidence if a safe live simulation is not available.

Then point to the rule prohibiting secrets, private code, personal data, and raw untrusted output. Explain that deterministic checks are defense in depth, not complete secret detection.

## 3:20–4:00 — Quality and Human Judgment

Show the recorded test summary and map it to AC1–AC12.

**Presenter:** “Automated tests replace the audio process with a fake runner so they can prove literal argument handling and failures without making noise. The primary demo still uses the real plugin and real `say` command.”

Name one risk Codex surfaced and the human disposition—for example, keeping visible text because voice alone is not accessible, or refusing to equate process success with proof the user heard the message.

## 4:00–4:30 — Close

**Presenter:** “The working product reduces unnoticed human-in-the-loop delays today. The workflow shows how Codex helped us move from scope to tested demo while humans controlled safety and product judgment. Next, we would add acknowledgement and other platforms only after defining their privacy and delivery guarantees.”

## If The Live Demo Fails

- State the exact failure without retrying repeatedly.
- Show the structured error and the closest verified evidence.
- Use a non-sensitive recording only to illustrate expected audio, clearly labeling it as backup.
- Do not hide the failure; connect it to the documented fallback and limitation.

## Evidence To Fill Before Presenting

- Verified test count and command: `[pending]`
- Clean-install tester/session: `[pending]`
- Human-changed or rejected Codex output: `[pending]`
- Confirmed live failure cases: `[pending]`
- Final known limitation to disclose: `[pending]`
