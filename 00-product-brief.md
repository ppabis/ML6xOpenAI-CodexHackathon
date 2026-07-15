# 00 Product Brief

## Product Idea

- **Working name:** Codex Voice Notification Plugin
- **One-sentence pitch:** A local Codex plugin that safely speaks short, actionable requests when a task is blocked on human input.

## Problem Statement

Codex tasks sometimes pause for human review, approval, credentials, device access, or real-world verification. When the user is away from the Codex window, these requests can go unnoticed and long-running work remains blocked.

Each notification should make clear:

- what needs attention and what action to take;
- which Codex task is waiting;
- how urgent the request is; and
- who the request is for.

## Target User

- **Primary:** Developers running long-lived or autonomous Codex tasks who frequently leave the Codex window.
- **Secondary:** Users managing several concurrent tasks and teams testing human-in-the-loop agent workflows.
- **Later:** Any local agent that needs real-world human intervention.

## Value Proposition

The plugin shortens unnoticed wait time without requiring cloud messaging or another device. A user hears a concise request through the current audio output, while Codex receives a structured result and remains responsible for waiting for the user's response.

## Smallest Useful Version

Provide one callable action with an interface equivalent to:

```text
notify_user(
  title: "PR review needed",
  message: "Please review pull request 42 and tell me whether I should merge it.",
  urgency: "normal"
)
```

On macOS, the action validates the request, invokes the built-in `say` command without a shell, plays through the default audio output, and returns a structured success or error response. `urgency` communicates context only; version one does not change system volume or interrupt other audio.

Confirmed interface limits are 40 characters for `title` and 200 characters for `message`. Urgency means: `low` for informational attention messages, `normal` for PR reviews and ordinary requests, and `high` for critical or incident-related requests.

## In Scope For Today

- Scaffold a local Codex plugin with a valid manifest and concise usage instructions.
- Expose one action accepting a title, message, and optional bounded urgency value.
- Use macOS local text-to-speech with no external service dependency.
- Enforce length limits and reject empty, unsafe, or intentionally sensitive content.
- Pass user input as process arguments rather than interpolated shell commands.
- Return structured success and failure results.
- Add small automated validation/process tests plus a manual audio test.
- Document installation, limitations, and a repeatable demo workflow.

## Safety and Invocation Rules

- Speak only when a task is genuinely blocked and the user may not see the screen.
- Summarize trusted task context; never speak raw tool output or untrusted content.
- Never include secrets, credentials, tokens, private code, or sensitive personal data.
- Keep announcements brief, actionable, and attributable to a task.
- Avoid repeated announcements; one call does not authorize automatic retries.
- Do not claim the requested human action occurred. Wait for explicit user confirmation.

Content checks reduce accidental disclosure but cannot reliably detect every secret. The caller and user-facing instructions remain the primary privacy boundary.

## Out Of Scope

- Speech recognition, voice replies, or two-way conversation.
- Push notifications, SMS, email, calls, cross-device delivery, or cloud TTS.
- Windows or Linux support in the first version.
- Voice cloning, custom voices, scheduling, or notification history.
- Changing volume or interrupting music and calls.
- Performing the requested real-world action on the user's behalf.

## Approved Phase 2 Companion

After the local-voice MVP was frozen and validated, the team approved a separate `mobile-notification` companion plugin for one consented recipient. Its first slice is SMS only through Twilio; it does not alter `notify_user`, add phone numbers to tool input, or claim delivery. Voice calls, replies, delivery webhooks, and multiple recipients remain out of scope.

## Assumptions and Constraints

- **Time:** Three hours for planning, implementation, validation, presentation preparation, and rehearsal.
- **Environment:** macOS with `say` available and a working default audio device.
- **Dependencies:** Prefer the standard library and existing Codex plugin tooling.
- **Privacy:** Spoken audio can be overheard; sensitive material must be excluded.
- **Accessibility:** Voice complements, but does not replace, the visible Codex request.
- **Team:** Work should split cleanly across plugin scaffolding, implementation, tests, and documentation/demo.

## Expected Demo

A simulated Codex task reaches a blocking point and announces:

> Aanchal, pull request 42 is ready. Please review the authentication changes and return to the Codex task when you are finished.

The message plays through the active speakers or headphones. The action reports success, and Codex waits for the user's response.

The demo also proves:

- an ordinary announcement succeeds;
- an excessively long message is rejected with a clear validation error;
- unavailable text-to-speech produces a clear structured error; and
- invocation guidance prohibits intentionally sensitive spoken content.

## Success Criteria

- A fresh local installation can complete the happy path using documented steps.
- Invalid input never reaches the speech process.
- No user-controlled text is evaluated by a shell.
- Success and failure are distinguishable by Codex.
- The demo can be repeated without editing code.

## Target Award Fit

This project intentionally targets two categories:

| Category | Why this project fits | Evidence required by demo time |
| --- | --- | --- |
| Best Working Product | The outcome is a real local Codex action with audible output, bounded inputs, safe execution, and observable failures. | Fresh-install run, live announcement, structured result, automated test output, one live validation failure, and one executed process-failure test. |
| Best AI-Native Workflow | The product itself enables human-in-the-loop agent work, and Codex is used across scoping, planning, architecture, implementation, review, and demo preparation. | Completed artifacts `00`–`08`, prompt/decision history, one changed or rejected Codex output, human review evidence, and a clear lifecycle story. |

Neither category should rely on presentation claims alone. The team must show executable product evidence for the first and an honest human–Codex decision trail for the second.

## Feasibility and Scope Cuts

The smallest end-to-end slice is manifest + one validated action + `say` + structured results + manual demo. The highest risks are Codex plugin discovery and reliable audio testing. A fixed real announcement must work by 1:00 and dynamic validated input by 1:30. If either gate slips, use direct project-scoped MCP configuration, reduce sensitive checks to a small synthetic fixture set, and drop secondary error variants before cutting length validation, shell-free execution, structured results, or the manual demo.

## Confirmed and Pending Decisions

Confirmed:

- Keep role labels as Person 1, Person 2, and Person 3.
- Limit titles to 40 characters and messages to 200 characters.
- Support `low`, `normal`, and `high` with the meanings above; urgency does not affect system volume.
- Speak `<title>. <message>`.
- Treat `spoken` as speech-process completion, then require an explicit typed listener reply in the current Codex task before continuing.
- Allow `low` only for justified informational attention, never routine automatic status chatter.
- Defer timeout/cancellation, cooldown, history, plugin-managed acknowledgement channels, cross-platform support, and other nice-to-haves.
- Use the synthetic PR-review message and fake password fixture documented in the test plan.

Pending before the final demo:

- A human teammate confirms new-task discovery, audible output, typed acknowledgement behavior, and the final privacy/demo review.

## Codex Support Requested

Codex should help define the interface and invocation rules; scaffold the plugin; implement safe local TTS; create unit and manual tests for success, failure, cancellation, and repetition; review privacy, security, accessibility, and notification-fatigue risks; write setup and demo documentation; and outline later Windows, Linux, acknowledgement, and richer-channel support.
