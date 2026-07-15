# 03 Architecture

## Architecture Decision

Build a repo-scoped Codex plugin containing instructions and one bundled local STDIO MCP server. The server exposes `notify_user`, validates the request, invokes macOS `/usr/bin/say`, and returns a structured result. There is no UI, cloud API, model call, or storage layer.

This follows current Codex plugin conventions: `.codex-plugin/plugin.json` is the required entry point; plugin components stay at the plugin root; local tools are exposed through an MCP server; and a repo marketplace can make the plugin installable for teammates.

## Two-Category Architecture Rationale

- **Working Product:** Use a real plugin, real MCP invocation, and real local `say` process for the primary demo. Fakes exist only at the process boundary for deterministic tests.
- **AI-Native Workflow:** The tool creates an explicit agent-to-human handoff. Codex can request attention, but validation and instructions constrain the request, and only the human can complete or confirm the real-world action.
- **Shared credibility:** Stable results, visible failure modes, and traceable decisions make both the product behavior and the collaboration process reviewable.

## Proposed Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Runtime | Node.js 20+ | Mature child-process controls, fast local setup, and one runtime for server and tests. |
| Language | ESM JavaScript | Removes compilation and type-tooling setup from the three-hour critical path. |
| Tool protocol | Local STDIO MCP server | Supported local Codex tool transport; no port, auth, or network required. |
| Plugin packaging | Codex manifest + `.mcp.json` + repo marketplace | Smallest shareable plugin shape for a local callable tool. |
| Speech adapter | Fixed `/usr/bin/say` executable | Built into macOS and requires no external TTS service. |
| Validation | Explicit schema plus small deterministic safety checks | Predictable length/enum enforcement without claiming comprehensive secret detection. |
| Tests | Built-in Node test runner with dependency-injected process adapter | No extra test dependency and no audio during automated tests. |
| Build | None | The MCP command runs the JavaScript entry point directly. |

The MCP SDK required by the generated scaffold is the only expected runtime dependency. Pin it after scaffolding and commit the lockfile.

## System Components

```text
Codex task
   |
   | MCP tool call: notify_user(title, message, urgency?)
   v
Local STDIO MCP server
   |
   +--> Input validator ------> safe validation error
   |
   +--> Speech composer (title + message)
   |
   +--> macOS speech adapter --spawn, shell:false--> /usr/bin/say
   |                                             |
   |<---------------- exit / error --------------+
   v
Structured result to Codex --> Codex reports status and waits for human
```

## Data Flow

1. Codex decides a task is genuinely blocked and summarizes trusted context into `title`, `message`, and optional `urgency`.
2. The MCP server parses the request and applies type, length, enum, character, and known-sensitive-pattern checks.
3. Invalid input returns a safe structured error before any child process starts.
4. Valid input becomes one bounded spoken string: `<title>. <message>`.
5. The adapter launches the fixed `say` executable with the spoken string as an argument, never as shell syntax.
6. The adapter waits for exit or process error and maps it to a stable result code.
7. Codex reports the result. A successful speech call does not acknowledge or perform the requested human action.

Data remains in process memory for the duration of the call. The plugin does not persist, transmit, or intentionally log the title or message.

## Tool Contract

```text
notify_user input
  title: string, 1..80 characters
  message: string, 1..300 characters
  urgency?: "low" | "normal" | "high" (default "normal")

success
  { ok: true, status: "spoken", urgency: <value> }

failure
  { ok: false, code: <stable code>, error: <safe diagnostic>, retryable: boolean }
```

Initial failure codes: `INVALID_INPUT`, `SENSITIVE_CONTENT`, `TTS_UNAVAILABLE`, and `TTS_FAILED`. Responses do not echo the spoken payload. Timeout and cancellation are deferred beyond the three-hour MVP.

## Proposed Project Layout

```text
.agents/plugins/marketplace.json
plugins/voice-notification/
  .codex-plugin/plugin.json
  .mcp.json
  skills/voice-notification/SKILL.md
  src/server.js
  src/notify-user.js
  src/validation.js
  src/speech.js
  tests/*.test.js
  package.json
  README.md
```

Final MCP configuration fields must be generated or verified against the installed Codex/plugin tooling during scaffolding; do not guess undocumented manifest values.

## Security, Privacy, and Accessibility Boundaries

- The executable path and arguments are separated; shell execution is disabled.
- Input length is bounded before composition and process launch.
- Instructions forbid secrets, credentials, private code, personal data, and raw untrusted output.
- Pattern checks are defense in depth, not a complete secret scanner.
- Error results omit payloads and process internals that may reveal content.
- Spoken audio can be overheard and is not an accessible-only notification channel; the visible Codex request remains available.
- `urgency` is metadata in MVP and never raises system volume or interrupts calls/music.

## Testing Strategy

- **Unit:** validation boundaries, urgency default, one risky fixture set, literal metacharacters, and response mapping.
- **Contract:** MCP tool schema and stable result shapes.
- **Integration without audio:** inject a fake executable/process runner and assert argument arrays and shell-disabled options.
- **Manual macOS:** real `say` success, muted/unavailable-output caveat, missing-command simulation, and repeat invocation behavior.

## Key Tradeoffs

- **JavaScript over TypeScript or a shell script:** less type safety than TypeScript, but no compile step; safer process control and better testability than shell.
- **Blocking until `say` exits:** slower calls, but success has a clear meaning and failures are observable.
- **macOS only:** narrow reach, but removes cloud dependencies and maximizes three-hour reliability.
- **No persistence:** no history or durable cooldown, but less privacy risk and complexity.
- **Simple sensitive checks:** demonstrable safeguards without overstating detection quality.

## Follow-Up Confirmation Layer

The voice-confirmation branch wraps the core `notifyUser` handler rather than
changing its validation or `/usr/bin/say` process boundary:

```text
notifyUser -> spoken -> text pending (default)
                     -> 5-second WAV -> Groq transcription
                                      -> local phrase classifier
                                      -> confirmed / declined / text fallback
```

- The only transcription model is `whisper-large-v3-turbo` at Groq's fixed
  audio-transcriptions endpoint.
- `ffmpeg` records macOS AVFoundation audio with fixed arguments and no shell.
- Temporary audio is deleted after transcription; transcripts and audio are
  not returned or logged.
- Missing credentials, microphone/ffmpeg failure, provider failure, silence,
  and unclear speech all become typed confirmation rather than success.
- `GROQ_API_KEY` is supplied through the environment and never stored in the
  plugin or marketplace manifest.

## Decision Owners

- Product Owner confirms limits, urgency semantics, and whether the title is spoken.
- Tech Lead verifies manifest/MCP schemas and package versions during scaffolding.
- Product/Quality/Demo Lead approves sensitive fixtures, failure evidence, and demo wording.

Each confirmed decision and any Codex suggestion that humans change or reject must be recorded in `08-codex-workflow-log.md` with its product impact.
