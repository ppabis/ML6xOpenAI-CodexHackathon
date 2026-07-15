import assert from "node:assert/strict";
import test from "node:test";

import { sendSms } from "../src/twilio.js";

const credentials = {
  accountSid: `AC${"a".repeat(32)}`,
  apiKey: `SK${"b".repeat(32)}`,
  apiSecret: "fake-api-secret-value",
  fromNumber: "+15551234567",
  toNumber: "+491701234567",
};

test("sendSms submits one form-encoded authenticated Twilio request", async () => {
  let invocation;
  const result = await sendSms(
    { credentials, body: "PR review. Please review pull request 42." },
    {
      fetchImpl: async (url, options) => {
        invocation = { url, options };
        return { ok: true, status: 201 };
      },
    },
  );

  assert.deepEqual(result, { status: "queued" });
  assert.match(invocation.url, /\/Messages\.json$/u);
  assert.equal(invocation.options.method, "POST");
  assert.equal(
    invocation.options.headers["Content-Type"],
    "application/x-www-form-urlencoded",
  );
  assert.match(invocation.options.headers.Authorization, /^Basic /u);
  const form = new URLSearchParams(invocation.options.body);
  assert.equal(form.get("To"), credentials.toNumber);
  assert.equal(form.get("From"), credentials.fromNumber);
  assert.equal(form.get("Body"), "PR review. Please review pull request 42.");
});

test("authentication, provider rate, and provider failures use safe codes", async () => {
  for (const [status, code] of [
    [401, "MOBILE_AUTH_FAILED"],
    [429, "MOBILE_RATE_LIMITED"],
    [500, "MOBILE_PROVIDER_FAILED"],
  ]) {
    await assert.rejects(
      sendSms(
        { credentials, body: "Private test body" },
        { fetchImpl: async () => ({ ok: false, status }) },
      ),
      (error) => {
        assert.equal(error.code, code);
        assert.equal(error.message.includes("Private test body"), false);
        return true;
      },
    );
  }
});

test("network exceptions become payload-free MOBILE_UNAVAILABLE", async () => {
  const privateDetail = "network included private payload";
  await assert.rejects(
    sendSms(
      { credentials, body: privateDetail },
      {
        fetchImpl: async () => {
          throw new Error(privateDetail);
        },
      },
    ),
    (error) => {
      assert.equal(error.code, "MOBILE_UNAVAILABLE");
      assert.equal(error.message.includes(privateDetail), false);
      return true;
    },
  );
});
