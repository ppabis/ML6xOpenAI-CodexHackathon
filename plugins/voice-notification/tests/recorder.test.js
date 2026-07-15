import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import test from "node:test";

import {
  createMacOsVoiceCapture,
  createUtteranceEndpoint,
  encodePcm16Wav,
} from "../src/recorder.js";
import { SILERO_FRAME_BYTES } from "../src/silero-vad.js";

function frame(value = 0) {
  return Buffer.alloc(SILERO_FRAME_BYTES, value);
}

function feed(endpoint, probabilities) {
  let decision;
  for (const [index, probability] of probabilities.entries()) {
    decision = endpoint.push(frame(index), probability);
    if (decision === "captured" || decision === "no-speech") {
      break;
    }
  }
  return decision;
}

test("noise never starts an utterance and stops after the onset window", () => {
  const endpoint = createUtteranceEndpoint();
  assert.equal(feed(endpoint, Array(157).fill(0.2)), "no-speech");
  assert.equal(endpoint.audio(), null);
});

test("speech onset retains only the 500 ms pre-roll", () => {
  const endpoint = createUtteranceEndpoint({ trailingSilenceMs: 32 });
  const probabilities = [
    ...Array(17).fill(0.1),
    0.8,
    0.8,
    0.8,
    0.1,
  ];
  assert.equal(feed(endpoint, probabilities), "captured");
  const audio = endpoint.audio();
  assert.equal(audio.length, 16 * SILERO_FRAME_BYTES);
  assert.equal(audio[0], 4);
  assert.equal(audio.at(-1), 19);
});

test("brief pauses do not stop speech but five seconds of silence do", () => {
  const endpoint = createUtteranceEndpoint();
  const probabilities = [
    0.8,
    0.8,
    0.8,
    ...Array(100).fill(0.1),
    0.6,
    ...Array(157).fill(0.1),
  ];
  assert.equal(feed(endpoint, probabilities), "captured");
});

test("continuous speech stops at the hard utterance limit", () => {
  const endpoint = createUtteranceEndpoint();
  assert.equal(feed(endpoint, Array(940).fill(0.9)), "captured");
  assert.ok(endpoint.audio().length > 0);
});

test("encodes private PCM as a mono 16 kHz WAV", () => {
  const wav = encodePcm16Wav(Buffer.alloc(1_024));
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt32LE(24), 16_000);
  assert.equal(wav.readUInt32LE(40), 1_024);
});

function fakeProcess() {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.exitCode = null;
  child.kill = (signal) => {
    assert.equal(signal, "SIGTERM");
    if (child.exitCode !== null) return;
    child.exitCode = 0;
    child.stdout.end();
    queueMicrotask(() => child.emit("close", 0));
  };
  return child;
}

test("streams FFmpeg without a shell, writes captured speech, and releases for reuse", async () => {
  const children = [];
  const writes = [];
  const vad = {
    async createDetector() {
      let calls = 0;
      return {
        async processFrame() {
          calls += 1;
          return calls <= 3 ? 0.9 : 0.1;
        },
      };
    },
  };
  const capture = createMacOsVoiceCapture({
    vad,
    accessImpl: async (path) => assert.equal(path, "/opt/homebrew/bin/ffmpeg"),
    spawnImpl: (executable, args, options) => {
      assert.equal(executable, "/opt/homebrew/bin/ffmpeg");
      assert.equal(options.shell, false);
      assert.deepEqual(options.stdio, ["ignore", "pipe", "ignore"]);
      assert.equal(args.at(-1), "pipe:1");
      const child = fakeProcess();
      children.push(child);
      queueMicrotask(() => {
        for (let index = 0; index < 5; index += 1) child.stdout.write(frame());
      });
      return child;
    },
    writeFileImpl: async (path, data, options) => writes.push({ path, data, options }),
    tmpdirImpl: () => "/tmp",
    randomUUIDImpl: () => `id-${children.length}`,
    endpointOptions: { trailingSilenceMs: 64 },
  });

  assert.deepEqual(await capture.captureUtterance(), {
    kind: "captured",
    audioPath: "/tmp/voice-confirmation-id-1.wav",
  });
  assert.deepEqual(await capture.captureUtterance(), {
    kind: "captured",
    audioPath: "/tmp/voice-confirmation-id-2.wav",
  });
  assert.equal(writes.length, 2);
  assert.equal(writes[0].options.mode, 0o600);
});

test("rejects concurrent microphone capture and terminates active capture on close", async () => {
  const child = fakeProcess();
  const capture = createMacOsVoiceCapture({
    vad: {
      createDetector: async () => ({ processFrame: async () => 0.1 }),
    },
    accessImpl: async () => {},
    spawnImpl: () => child,
  });

  const first = capture.captureUtterance();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(await capture.captureUtterance(), { kind: "unavailable" });
  await capture.close();
  assert.deepEqual(await first, { kind: "unavailable" });
  assert.equal(child.exitCode, 0);
});

test("returns no-speech without creating a temporary file", async () => {
  const child = fakeProcess();
  let writes = 0;
  const capture = createMacOsVoiceCapture({
    vad: {
      createDetector: async () => ({ processFrame: async () => 0.1 }),
    },
    accessImpl: async () => {},
    spawnImpl: () => {
      queueMicrotask(() => child.stdout.write(frame()));
      return child;
    },
    writeFileImpl: async () => {
      writes += 1;
    },
    endpointOptions: { onsetWindowMs: 32 },
  });

  assert.deepEqual(await capture.captureUtterance(), { kind: "no-speech" });
  assert.equal(writes, 0);
});

test("maps detector and process failures to unavailable without throwing details", async () => {
  let spawns = 0;
  const detectorFailure = createMacOsVoiceCapture({
    vad: {
      createDetector: async () => {
        throw new Error("private model detail");
      },
    },
    accessImpl: async () => {},
    spawnImpl: () => {
      spawns += 1;
    },
  });
  assert.deepEqual(await detectorFailure.captureUtterance(), {
    kind: "unavailable",
  });
  assert.equal(spawns, 0);

  const child = fakeProcess();
  const processFailure = createMacOsVoiceCapture({
    vad: {
      createDetector: async () => ({ processFrame: async () => 0.1 }),
    },
    accessImpl: async () => {},
    spawnImpl: () => {
      queueMicrotask(() => {
        child.stdout.end();
        child.emit("error", new Error("private process detail"));
      });
      return child;
    },
  });
  assert.deepEqual(await processFailure.captureUtterance(), {
    kind: "unavailable",
  });
});
