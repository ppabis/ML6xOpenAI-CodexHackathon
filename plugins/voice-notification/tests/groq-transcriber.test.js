import assert from "node:assert/strict";
import test from "node:test";

import {
  createGroqTranscriber,
  GROQ_TRANSCRIPTION_MODEL,
} from "../src/groq-transcriber.js";

test("uses only Whisper Large V3 Turbo at the fixed Groq endpoint", async () => {
  const requests = [];
  const transcribe = createGroqTranscriber({
    apiKeyProvider: () => "test-key",
    readFileImpl: async () => Buffer.from("fake wav"),
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => ({ text: "confirmed" }) };
    },
  });

  assert.equal(await transcribe("/tmp/fake.wav"), "confirmed");
  assert.equal(GROQ_TRANSCRIPTION_MODEL, "whisper-large-v3-turbo");
  assert.equal(
    requests[0].url,
    "https://api.groq.com/openai/v1/audio/transcriptions",
  );
  assert.equal(requests[0].options.method, "POST");
  assert.equal(
    requests[0].options.body.get("model"),
    "whisper-large-v3-turbo",
  );
  assert.equal(requests[0].options.body.get("response_format"), "json");
});

test("does not call Groq without an API key", async () => {
  let called = false;
  const transcribe = createGroqTranscriber({
    apiKeyProvider: () => undefined,
    fetchImpl: async () => {
      called = true;
    },
  });

  await assert.rejects(() => transcribe("/tmp/fake.wav"));
  assert.equal(called, false);
});
