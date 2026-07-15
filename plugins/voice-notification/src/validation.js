export const MAX_TITLE_LENGTH = 40;
export const MAX_MESSAGE_LENGTH = 200;
export const DEFAULT_URGENCY = "normal";
export const URGENCIES = new Set(["low", "normal", "high"]);

const CONTROL_CHARACTER_PATTERN = /[\x00-\x1F\x7F]/u;
const SENSITIVE_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{10,}\b/u,
  /\b(?:api[_-]?key|token|password)\s*[:=]\s*\S+/iu
];

export function validateNotifyInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return invalid("Input must be an object.");
  }

  const { title, message, urgency = DEFAULT_URGENCY } = input;

  if (typeof title !== "string" || title.trim().length === 0) {
    return invalid("Title is required.");
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return invalid("Message is required.");
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return invalid(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return invalid(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
  }

  if (!URGENCIES.has(urgency)) {
    return invalid("Urgency must be low, normal, or high.");
  }

  if (CONTROL_CHARACTER_PATTERN.test(title) || CONTROL_CHARACTER_PATTERN.test(message)) {
    return invalid("Title and message must not contain control characters.");
  }

  if (containsSensitiveContent(title) || containsSensitiveContent(message)) {
    return {
      ok: false,
      code: "SENSITIVE_CONTENT",
      error: "Input appears to contain sensitive content.",
      retryable: false
    };
  }

  return {
    ok: true,
    value: {
      title,
      message,
      urgency
    }
  };
}

export function containsSensitiveContent(value) {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(value));
}

function invalid(error) {
  return {
    ok: false,
    code: "INVALID_INPUT",
    error,
    retryable: false
  };
}
