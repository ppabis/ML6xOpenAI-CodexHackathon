---
name: voice-notification
description: Speak a short local macOS notification and wait for typed or bounded voice confirmation when a Codex task is genuinely blocked on a person's real-world action or decision. Use only for a necessary human handoff, never as a routine completion alert or status update.
---

# Voice notification

Use `notify_user` only when work cannot continue without a person's real-world action or decision.

## Prepare the request

- Write a short, trusted summary: a title of at most 40 characters and a message of at most 200 characters.
- State what needs attention and what the person should do next.
- Never include credentials, secrets, tokens, private code, personal data, or raw tool output.
- Treat `urgency` as metadata only. Use `normal` unless the situation clearly warrants `low` or `high`; do not imply it changes volume or interrupts other audio.
- Use `confirmationMode: "text"` by default. Use `voice` only when the user has opted into microphone recording and Groq transcription.
- For voice confirmation, tell the user before speech ends that listening will start immediately, allow five seconds for speech to begin, and ask for an explicit phrase such as “confirmed,” “done,” “yes,” “no,” or “not yet.”

## Notify and wait

1. Call `notify_user` once with the prepared title, message, and optional urgency.
2. Report the structured result without repeating sensitive input.
3. Treat only `confirmed` as confirmation. `awaiting_confirmation` means wait for a typed response; `declined` means do not continue.
4. If voice is unclear or unavailable, the tool falls back to `awaiting_confirmation` with text as the method. Never infer confirmation from ambiguity or silence.
5. If the call fails, report the safe error. Do not retry automatically.
6. Wait for explicit human confirmation before treating the real-world action as complete or continuing blocked work.

Voice mode detects speech locally with the bundled Silero ONNX model. It waits up to five seconds for speech onset, keeps 500 ms of pre-roll, stops after five seconds without speech, and enforces a 30-second utterance cap. It sends one bounded temporary clip to Groq using only `whisper-large-v3-turbo`, reduces the transcript to a deterministic decision, and deletes the clip. Noise or silence never implies confirmation. The tool has no notification history or delivery guarantee. Spoken audio may be muted, routed to another device, or overheard.
