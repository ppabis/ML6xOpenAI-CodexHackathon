import { createSayRunner } from "./speech.js";
import { validateNotifyInput } from "./validation.js";

export function composeSpeech({ title, message }) {
  return `${title}. ${message}`;
}

export async function notifyUser(input, { runner = createSayRunner() } = {}) {
  const validation = validateNotifyInput(input);

  if (!validation.ok) {
    return validation;
  }

  const { urgency } = validation.value;
  const spokenText = composeSpeech(validation.value);
  const speechResult = await runner(spokenText);

  if (speechResult && speechResult.ok) {
    return {
      ok: true,
      status: "spoken",
      urgency
    };
  }

  if (speechResult && speechResult.reason === "unavailable") {
    return {
      ok: false,
      code: "TTS_UNAVAILABLE",
      error: "Text-to-speech is unavailable on this machine.",
      retryable: true
    };
  }

  return {
    ok: false,
    code: "TTS_FAILED",
    error: "Text-to-speech failed before the notification completed.",
    retryable: true
  };
}
