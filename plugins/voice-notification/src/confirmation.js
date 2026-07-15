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

    if (
      voiceResult?.kind === "responded" &&
      typeof voiceResult.message === "string" &&
      voiceResult.message.length > 0
    ) {
      return {
        ok: true,
        status: "responded",
        urgency: notificationResult.urgency,
        response: {
          method: "voice",
          message: voiceResult.message,
        },
      };
    }

    return textPending(notificationResult.urgency, "voice");
  };
}
