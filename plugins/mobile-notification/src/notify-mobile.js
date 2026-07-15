import { loadCredentials } from "./credentials.js";
import { createRateLimiter } from "./rate-limit.js";
import { sendSms } from "./twilio.js";
import { validateNotification } from "./validation.js";

const defaultLimiter = createRateLimiter();

const safeFailure = (code, retryable = false) => ({
  ok: false,
  code,
  error: "The mobile notification could not be queued.",
  retryable,
});

export async function notifyMobile(
  input,
  {
    credentialLoader = loadCredentials,
    smsSender = sendSms,
    limiter = defaultLimiter,
  } = {},
) {
  const validation = validateNotification(input);
  if (!validation.ok) return validation;

  let credentials;
  try {
    credentials = await credentialLoader();
  } catch {
    return safeFailure("MOBILE_NOT_CONFIGURED", false);
  }

  if (!limiter.take()) {
    return safeFailure("MOBILE_RATE_LIMITED", true);
  }

  const { title, message, channel, urgency } = validation.value;
  const body = `${title}. ${message}`;

  try {
    await smsSender({ credentials, body });
    return { ok: true, status: "queued", channel, urgency };
  } catch (error) {
    const allowedCodes = new Set([
      "MOBILE_AUTH_FAILED",
      "MOBILE_RATE_LIMITED",
      "MOBILE_UNAVAILABLE",
      "MOBILE_PROVIDER_FAILED",
    ]);
    const code = allowedCodes.has(error?.code)
      ? error.code
      : "MOBILE_PROVIDER_FAILED";
    return safeFailure(code, error?.retryable === true);
  }
}
