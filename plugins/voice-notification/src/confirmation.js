const CONFIRMED_PHRASES = new Set([
  "confirmed",
  "done",
  "yes",
  "yes confirmed",
  "it is done",
]);

const DECLINED_PHRASES = new Set([
  "no",
  "not yet",
  "declined",
  "do not continue",
]);

function normalizeTranscript(transcript) {
  return transcript
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyConfirmation(transcript) {
  if (typeof transcript !== "string") {
    return "unclear";
  }

  const normalized = normalizeTranscript(transcript);
  if (CONFIRMED_PHRASES.has(normalized)) {
    return "confirmed";
  }
  if (DECLINED_PHRASES.has(normalized)) {
    return "declined";
  }
  return "unclear";
}

function textPending(urgency, fallbackFrom) {
  return {
    ok: true,
    status: "awaiting_confirmation",
    urgency,
    confirmation: {
      method: "text",
      state: "pending",
      ...(fallbackFrom ? { fallbackFrom } : {}),
    },
  };
}

export function createNotifyWithConfirmation({ notifyUser, confirmByVoice }) {
  if (typeof notifyUser !== "function") {
    throw new TypeError("notifyUser must be a function");
  }
  if (typeof confirmByVoice !== "function") {
    throw new TypeError("confirmByVoice must be a function");
  }

  return async function notifyWithConfirmation(input) {
    const confirmationMode = input?.confirmationMode ?? "text";
    if (!new Set(["text", "voice"]).has(confirmationMode)) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        error: "Confirmation mode is invalid.",
        retryable: false,
      };
    }

    const { confirmationMode: _, ...notificationInput } = input;
    const notificationResult = await notifyUser(notificationInput);
    if (!notificationResult.ok || notificationResult.status !== "spoken") {
      return notificationResult;
    }

    if (confirmationMode === "text") {
      return textPending(notificationResult.urgency);
    }

    let voiceResult;
    try {
      voiceResult = await confirmByVoice();
    } catch {
      return textPending(notificationResult.urgency, "voice");
    }

    if (voiceResult === "confirmed" || voiceResult === "declined") {
      return {
        ok: true,
        status: voiceResult,
        urgency: notificationResult.urgency,
        confirmation: {
          method: "voice",
          state: voiceResult,
        },
      };
    }

    return textPending(notificationResult.urgency, "voice");
  };
}
