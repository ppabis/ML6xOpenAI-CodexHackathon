import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  SILERO_FRAME_BYTES,
  createSileroVad,
} from "../src/silero-vad.js";

class FakeTensor {
  constructor(type, data, dimensions) {
    this.type = type;
    this.data = data;
    this.dims = dimensions;
  }
}

function pcmFrame(value) {
  const frame = Buffer.alloc(SILERO_FRAME_BYTES);
  for (let offset = 0; offset < frame.length; offset += 2) {
    frame.writeInt16LE(value, offset);
  }
  return frame;
}

test("bundles the checksum-pinned Silero v6.2 model", async () => {
  const model = await readFile(new URL("../models/silero_vad.onnx", import.meta.url));
  assert.equal(
    createHash("sha256").update(model).digest("hex"),
    "1a153a22f4509e292a94e67d6f9b85e8deb25b4988682b7e174c65279d8788e3",
  );
});

test("shares one ONNX session while isolating detector state and context", async () => {
  let sessionLoads = 0;
  const feeds = [];
  const session = {
    async run(feed) {
      feeds.push(feed);
      return {
        output: { data: new Float32Array([0.75]) },
        stateN: { data: new Float32Array(256).fill(feeds.length) },
      };
    },
  };
  const vad = createSileroVad({
    modelPath: "/models/pinned.onnx",
    createSession: async (path) => {
      assert.equal(path, "/models/pinned.onnx");
      sessionLoads += 1;
      return session;
    },
    Tensor: FakeTensor,
  });

  const first = await vad.createDetector();
  const second = await vad.createDetector();
  assert.equal(await first.processFrame(pcmFrame(16_384)), 0.75);
  assert.equal(await first.processFrame(pcmFrame(8_192)), 0.75);
  assert.equal(await second.processFrame(pcmFrame(4_096)), 0.75);

  assert.equal(sessionLoads, 1);
  assert.deepEqual(feeds[0].input.dims, [1, 576]);
  assert.deepEqual(feeds[0].state.dims, [2, 1, 128]);
  assert.deepEqual(feeds[0].sr.dims, [1]);
  assert.equal(feeds[0].sr.type, "int64");
  assert.equal(feeds[0].state.data.every((value) => value === 0), true);
  assert.equal(feeds[1].state.data.every((value) => value === 1), true);
  assert.equal(feeds[2].state.data.every((value) => value === 0), true);
  assert.equal(feeds[1].input.data[0], 0.5);
});

test("rejects invalid model results without including input data", async () => {
  const vad = createSileroVad({
    createSession: async () => ({
      run: async () => ({ output: { data: new Float32Array([Number.NaN]) } }),
    }),
    Tensor: FakeTensor,
  });
  const detector = await vad.createDetector();

  await assert.rejects(
    () => detector.processFrame(pcmFrame(123)),
    /^Error: Silero VAD returned an invalid result\.$/,
  );
});
