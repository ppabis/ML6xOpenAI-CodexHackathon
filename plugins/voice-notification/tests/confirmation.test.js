import assert from "node:assert/strict";
import test from "node:test";

import { createNotifyWithConfirmation } from "../src/confirmation.js";

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

test("returns an arbitrary spoken response to the caller", async () => {
  const notify = createNotifyWithConfirmation({
    notifyUser: async () => ({ ok: true, status: "spoken", urgency: "high" }),
    confirmByVoice: async () => ({
      kind: "responded",
      message: "Open the logs and check the second failure.",
    }),
  });

  const result = await notify({
    title: "Review",
    message: "Return now.",
    confirmationMode: "voice",
  });

  assert.deepEqual(result, {
    ok: true,
    status: "responded",
    urgency: "high",
    response: {
      method: "voice",
      message: "Open the logs and check the second failure.",
    },
  });
});

test("falls back to text when voice is empty or unavailable", async () => {
  for (const voiceResult of [
    "unavailable",
    { kind: "responded", message: "" },
  ]) {
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
