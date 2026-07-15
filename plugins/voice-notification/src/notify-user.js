import { runSpeech } from "./speech.js";
import { validateNotification } from "./validation.js";

const speechFailure = (code) => ({
  ok: false,
  code,
  error:
    code === "TTS_UNAVAILABLE"
      ? "Text-to-speech is unavailable."
      : "Text-to-speech failed.",
  retryable: false,
});

export async function notifyUser(input, { speechRunner = runSpeech } = {}) {
  const validation = validateNotification(input);
  if (!validation.ok) return validation;

  const { title, message, urgency } = validation.value;
  const speechText = `${title}. ${message}`;

  try {
    await speechRunner(speechText);
    return { ok: true, status: "spoken", urgency };
  } catch (error) {
    return speechFailure(
      error?.code === "TTS_UNAVAILABLE" ? "TTS_UNAVAILABLE" : "TTS_FAILED",
    );
  }
}
