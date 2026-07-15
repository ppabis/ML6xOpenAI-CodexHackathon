import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyConfirmation,
  createNotifyWithConfirmation,
} from "../src/confirmation.js";

test("classifies only explicit confirmation and decline phrases", () => {
  assert.equal(classifyConfirmation("Yes, confirmed."), "confirmed");
  assert.equal(classifyConfirmation("Not yet."), "declined");
  assert.equal(classifyConfirmation("I think that may be okay"), "unclear");
});

test("defaults to text confirmation and strips wrapper input", async () => {
  const calls = [];
  const notify = createNotifyWithConfirmation({
    notifyUser: async (input) => {
      calls.push(input);
      return { ok: true, status: "spoken", urgency: "normal" };
    },
    confirmByVoice: async () => assert.fail("voice must not start"),
  });

  const result = await notify({ title: "Review", message: "Return now." });

  assert.deepEqual(calls, [{ title: "Review", message: "Return now." }]);
  assert.deepEqual(result, {
    ok: true,
    status: "awaiting_confirmation",
    urgency: "normal",
    confirmation: { method: "text", state: "pending" },
  });
});

test("returns voice decisions without exposing a transcript", async () => {
  const notify = createNotifyWithConfirmation({
    notifyUser: async () => ({ ok: true, status: "spoken", urgency: "high" }),
    confirmByVoice: async () => "confirmed",
  });

  const result = await notify({
    title: "Review",
    message: "Return now.",
    confirmationMode: "voice",
  });

  assert.deepEqual(result, {
    ok: true,
    status: "confirmed",
    urgency: "high",
    confirmation: { method: "voice", state: "confirmed" },
  });
  assert.equal("transcript" in result, false);
});

test("falls back to text when voice is unclear or unavailable", async () => {
  for (const voiceResult of ["unclear", "unavailable"]) {
    const notify = createNotifyWithConfirmation({
      notifyUser: async () => ({ ok: true, status: "spoken", urgency: "low" }),
      confirmByVoice: async () => voiceResult,
    });
    const result = await notify({
      title: "Review",
      message: "Return now.",
      confirmationMode: "voice",
    });
    assert.deepEqual(result.confirmation, {
      method: "text",
      state: "pending",
      fallbackFrom: "voice",
    });
  }
});
