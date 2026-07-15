---
name: voice-notification
description: Speak a short local macOS notification and wait for typed input or one bounded, transcribed spoken response when a Codex task is genuinely blocked on a person's real-world action or decision. Use only for a necessary human handoff, never as a routine completion alert or status update.
---

# Voice notification

Use `notify_user` only when work cannot continue without a person's real-world action or decision.

## Prepare the request

- Write a short, trusted summary: a title of at most 40 characters and a message of at most 200 characters.
- State what needs attention and what the person should do next.
- Never include credentials, secrets, tokens, private code, personal data, or raw tool output.
- Know that notification text is sent to ElevenLabs when `ELEVENLABS_API_KEY` is configured. Keep the summary appropriate for cloud synthesis.
- Treat `urgency` as metadata only. Use `normal` unless the situation clearly warrants `low` or `high`; do not imply it changes volume or interrupts other audio.
- Use `confirmationMode: "text"` by default. Use `voice` only when the user has opted into microphone recording, Groq transcription, and returning the transcript to the current task.
- For a voice response, tell the user before speech ends that listening will start immediately and allow five seconds for speech to begin. Invite a natural response rather than requiring a confirmation phrase.
- Tell the user not to speak credentials, secrets, private code, or sensitive personal data.

## Notify and wait

1. Call `notify_user` once with the prepared title, message, and optional urgency.
2. Report the structured result without repeating sensitive input.
3. Treat `responded` as a new user message. Read `response.message`, interpret it in the current task, and do not assume it authorizes unrelated actions.
4. `awaiting_confirmation` means wait for a typed response. If voice is empty or unavailable, the tool falls back to text; never infer a response from silence.
5. If the call fails, report the safe error. Do not retry automatically.
6. Use the spoken response exactly as you would a typed user reply. Continue only when its meaning resolves the blocker.

Notification speech uses the default English ElevenLabs `Sarah` voice when `ELEVENLABS_API_KEY` is configured; otherwise it uses local macOS `say`. A configured ElevenLabs failure never falls back to local speech. Voice-response mode detects speech locally with the bundled Silero ONNX model. It waits up to five seconds for speech onset, keeps 500 ms of pre-roll, stops after five seconds without speech, and enforces a 30-second utterance cap. It sends one bounded temporary clip to Groq using only `whisper-large-v3-turbo`, returns the non-empty transcript as `response.message`, and deletes the clip. Noise or silence never implies a response. The tool has no notification history or delivery guarantee. Spoken audio may be overheard.
