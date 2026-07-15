import assert from "node:assert/strict";
import test from "node:test";

import { createVoiceConfirmer } from "../src/voice-confirmation.js";

test("deletes temporary audio and returns only a decision", async () => {
  const deleted = [];
  const confirm = createVoiceConfirmer({
    recordAudio: async () => "/tmp/private.wav",
    transcribeAudio: async () => "Done.",
    deleteAudio: async (path) => deleted.push(path),
  });

  assert.equal(await confirm(), "confirmed");
  assert.deepEqual(deleted, ["/tmp/private.wav"]);
});

test("deletes audio and returns unavailable when transcription fails", async () => {
  const deleted = [];
  const confirm = createVoiceConfirmer({
    recordAudio: async () => "/tmp/private.wav",
    transcribeAudio: async () => {
      throw new Error("secret provider detail");
    },
    deleteAudio: async (path) => deleted.push(path),
  });

  assert.equal(await confirm(), "unavailable");
  assert.deepEqual(deleted, ["/tmp/private.wav"]);
});
