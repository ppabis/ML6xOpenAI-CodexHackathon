export class TwilioError extends Error {
  constructor(code, retryable = false) {
    super("Mobile provider request failed.");
    this.name = "TwilioError";
    this.code = code;
    this.retryable = retryable;
  }
}

function classifyStatus(status) {
  if (status === 401 || status === 403) {
    return new TwilioError("MOBILE_AUTH_FAILED", false);
  }

  if (status === 429) {
    return new TwilioError("MOBILE_RATE_LIMITED", true);
  }

  return new TwilioError("MOBILE_PROVIDER_FAILED", status >= 500);
}

export async function sendSms(
  { credentials, body },
  { fetchImpl = globalThis.fetch } = {},
) {
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(credentials.accountSid)}/Messages.json`;
  const form = new URLSearchParams({
    To: credentials.toNumber,
    From: credentials.fromNumber,
    Body: body,
  });
  const authorization = Buffer.from(
    `${credentials.apiKey}:${credentials.apiSecret}`,
    "utf8",
  ).toString("base64");

  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new TwilioError("MOBILE_UNAVAILABLE", true);
  }

  if (!response || response.ok !== true) {
    throw classifyStatus(response?.status ?? 500);
  }

  return { status: "queued" };
}
