import assert from "node:assert/strict";
import test from "node:test";

import { createVoiceConfirmer } from "../src/voice-confirmation.js";

test("deletes temporary audio and returns the complete spoken response", async () => {
  const deleted = [];
  const confirm = createVoiceConfirmer({
    captureUtterance: async () => ({
      kind: "captured",
      audioPath: "/tmp/private.wav",
    }),
    transcribeAudio: async () => "  Please open the pull request.  ",
    deleteAudio: async (path) => deleted.push(path),
  });

  assert.deepEqual(await confirm(), {
    kind: "responded",
    message: "Please open the pull request.",
  });
  assert.deepEqual(deleted, ["/tmp/private.wav"]);
});

test("deletes audio and rejects empty or punctuation-only transcripts", async () => {
  for (const transcript of ["   ", "."]) {
    const deleted = [];
    const confirm = createVoiceConfirmer({
      captureUtterance: async () => ({
        kind: "captured",
        audioPath: "/tmp/private.wav",
      }),
      transcribeAudio: async () => transcript,
      deleteAudio: async (path) => deleted.push(path),
    });

    assert.equal(await confirm(), "unavailable");
    assert.deepEqual(deleted, ["/tmp/private.wav"]);
  }
});

test("accepts non-English spoken responses", async () => {
  const confirm = createVoiceConfirmer({
    captureUtterance: async () => ({
      kind: "captured",
      audioPath: "/tmp/private.wav",
    }),
    transcribeAudio: async () => "Öffne bitte den Pull Request.",
    deleteAudio: async () => {},
  });

  assert.deepEqual(await confirm(), {
    kind: "responded",
    message: "Öffne bitte den Pull Request.",
  });
});

test("deletes audio and returns unavailable when transcription fails", async () => {
  const deleted = [];
  const confirm = createVoiceConfirmer({
    captureUtterance: async () => ({
      kind: "captured",
      audioPath: "/tmp/private.wav",
    }),
    transcribeAudio: async () => {
      throw new Error("secret provider detail");
    },
    deleteAudio: async (path) => deleted.push(path),
  });

  assert.equal(await confirm(), "unavailable");
  assert.deepEqual(deleted, ["/tmp/private.wav"]);
});

test("does not transcribe or delete when no speech is detected", async () => {
  let transcriptions = 0;
  const confirm = createVoiceConfirmer({
    captureUtterance: async () => ({ kind: "no-speech" }),
    transcribeAudio: async () => {
      transcriptions += 1;
    },
  });

  assert.equal(await confirm(), "unavailable");
  assert.equal(transcriptions, 0);
});
