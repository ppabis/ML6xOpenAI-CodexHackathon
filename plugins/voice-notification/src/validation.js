export const TITLE_MAX_LENGTH = 40;
export const MESSAGE_MAX_LENGTH = 200;
export const URGENCIES = Object.freeze(["low", "normal", "high"]);

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/u;
const SENSITIVE_PATTERNS = [
  /\b(?:api[_ -]?key|password|passwd|secret|access[_ -]?token|auth[_ -]?token|token)\s*[:=]\s*(?:"[^"]+"|'[^']+'|[^\s,;]+)/iu,
  /\bbearer\s+[a-z0-9._~+\/-]{8,}={0,2}\b/iu,
  /\b(?:sk|rk|pk)_(?:live|test)_[a-z0-9]{8,}\b/iu,
];

const failure = (code, error) => ({
  ok: false,
  code,
  error,
  retryable: false,
});

export const invalidInput = () =>
  failure("INVALID_INPUT", "Notification input is invalid.");

export const sensitiveContent = () =>
  failure(
    "SENSITIVE_CONTENT",
    "Notification contains content that cannot be spoken safely.",
  );

function containsSensitiveContent(text) {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
}

export function validateNotification(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return invalidInput();
  }

  const allowedKeys = new Set(["title", "message", "urgency"]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    return invalidInput();
  }

  const { title, message } = input;
  const urgency = input.urgency ?? "normal";

  if (typeof title !== "string" || typeof message !== "string") {
    return invalidInput();
  }

  // Reject controls before trimming so a leading newline cannot disappear during
  // normalization and then reach the speech process.
  if (CONTROL_CHARACTERS.test(title) || CONTROL_CHARACTERS.test(message)) {
    return invalidInput();
  }

  const normalizedTitle = title.trim();
  const normalizedMessage = message.trim();

  if (
    normalizedTitle.length === 0 ||
    normalizedTitle.length > TITLE_MAX_LENGTH ||
    normalizedMessage.length === 0 ||
    normalizedMessage.length > MESSAGE_MAX_LENGTH ||
    !URGENCIES.includes(urgency)
  ) {
    return invalidInput();
  }

  if (
    containsSensitiveContent(normalizedTitle) ||
    containsSensitiveContent(normalizedMessage)
  ) {
    return sensitiveContent();
  }

  return {
    ok: true,
    value: {
      title: normalizedTitle,
      message: normalizedMessage,
      urgency,
    },
  };
}
