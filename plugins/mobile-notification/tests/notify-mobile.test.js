import assert from "node:assert/strict";
import test from "node:test";

import { notifyMobile } from "../src/notify-mobile.js";

const input = {
  title: "PR review needed",
  message: "Please review pull request 42.",
};

const credentials = {
  accountSid: `AC${"a".repeat(32)}`,
  apiKey: `SK${"b".repeat(32)}`,
  apiSecret: "fake-api-secret-value",
  fromNumber: "+15551234567",
  toNumber: "+491701234567",
};

const allow = { take: () => true };

test("valid input loads configuration, queues SMS, and returns safe success", async () => {
  let sent;
  const result = await notifyMobile(input, {
    credentialLoader: async () => credentials,
    smsSender: async (request) => {
      sent = request;
      return { status: "queued" };
    },
    limiter: allow,
  });

  assert.deepEqual(sent, {
    credentials,
    body: "PR review needed. Please review pull request 42.",
  });
  assert.deepEqual(result, {
    ok: true,
    status: "queued",
    channel: "sms",
    urgency: "normal",
  });
});

test("invalid and sensitive inputs stop before Keychain or network access", async () => {
  for (const invalidInput of [
    { title: "Title", message: "M".repeat(301) },
    { title: "Secret", message: "password=FAKE_TEST_ONLY_12345" },
  ]) {
    let credentialCalls = 0;
    let senderCalls = 0;
    const result = await notifyMobile(invalidInput, {
      credentialLoader: async () => {
        credentialCalls += 1;
        return credentials;
      },
      smsSender: async () => {
        senderCalls += 1;
      },
      limiter: allow,
    });

    assert.equal(result.ok, false);
    assert.equal(credentialCalls, 0);
    assert.equal(senderCalls, 0);
    assert.equal(JSON.stringify(result).includes(invalidInput.message), false);
  }
});

test("missing Keychain configuration returns safe failure without sending", async () => {
  let sent = false;
  const result = await notifyMobile(input, {
    credentialLoader: async () => {
      throw new Error("private Keychain details");
    },
    smsSender: async () => {
      sent = true;
    },
    limiter: allow,
  });

  assert.equal(sent, false);
  assert.deepEqual(result, {
    ok: false,
    code: "MOBILE_NOT_CONFIGURED",
    error: "The mobile notification could not be queued.",
    retryable: false,
  });
});

test("local rate limit rejects before provider access", async () => {
  let sent = false;
  const result = await notifyMobile(input, {
    credentialLoader: async () => credentials,
    smsSender: async () => {
      sent = true;
    },
    limiter: { take: () => false },
  });

  assert.equal(sent, false);
  assert.equal(result.code, "MOBILE_RATE_LIMITED");
});

test("provider failures are allowlisted and payload-free", async () => {
  const privateDetail = `${input.title}. ${input.message}`;
  for (const providerError of [
    Object.assign(new Error(privateDetail), {
      code: "MOBILE_AUTH_FAILED",
      retryable: false,
    }),
    Object.assign(new Error(privateDetail), {
      code: "UNEXPECTED_PRIVATE_CODE",
      retryable: true,
    }),
  ]) {
    const result = await notifyMobile(input, {
      credentialLoader: async () => credentials,
      smsSender: async () => {
        throw providerError;
      },
      limiter: allow,
    });

    assert.equal(result.ok, false);
    assert.equal(JSON.stringify(result).includes(privateDetail), false);
  }
});
