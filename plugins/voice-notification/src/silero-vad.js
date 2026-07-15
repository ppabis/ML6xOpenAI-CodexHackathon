import { fileURLToPath } from "node:url";

import * as ort from "onnxruntime-node";

export const SILERO_SAMPLE_RATE = 16_000;
export const SILERO_FRAME_SAMPLES = 512;
export const SILERO_FRAME_BYTES = SILERO_FRAME_SAMPLES * 2;

const SILERO_CONTEXT_SAMPLES = 64;
const SILERO_STATE_SIZE = 2 * 1 * 128;
const DEFAULT_MODEL_PATH = fileURLToPath(
  new URL("../models/silero_vad.onnx", import.meta.url),
);

function pcm16ToFloat32(frame) {
  if (!Buffer.isBuffer(frame) || frame.length !== SILERO_FRAME_BYTES) {
    throw new TypeError("Silero VAD requires one 512-sample PCM frame.");
  }

  const samples = new Float32Array(SILERO_FRAME_SAMPLES);
  for (let index = 0; index < SILERO_FRAME_SAMPLES; index += 1) {
    samples[index] = frame.readInt16LE(index * 2) / 32_768;
  }
  return samples;
}

function validOutput(result) {
  const probability = result?.output?.data?.[0];
  const state = result?.stateN?.data;
  if (
    typeof probability !== "number" ||
    !Number.isFinite(probability) ||
    probability < 0 ||
    probability > 1 ||
    !(state instanceof Float32Array) ||
    state.length !== SILERO_STATE_SIZE
  ) {
    throw new Error("Silero VAD returned an invalid result.");
  }
  return { probability, state };
}

export function createSileroVad({
  modelPath = DEFAULT_MODEL_PATH,
  createSession = (path) => ort.InferenceSession.create(path),
  Tensor = ort.Tensor,
} = {}) {
  let sessionPromise;

  function loadSession() {
    sessionPromise ??= Promise.resolve().then(() => createSession(modelPath));
    return sessionPromise;
  }

  return {
    async createDetector() {
      const session = await loadSession();
      let state = new Float32Array(SILERO_STATE_SIZE);
      let context = new Float32Array(SILERO_CONTEXT_SAMPLES);

      return {
        async processFrame(frame) {
          const samples = pcm16ToFloat32(frame);
          const input = new Float32Array(
            SILERO_CONTEXT_SAMPLES + SILERO_FRAME_SAMPLES,
          );
          input.set(context);
          input.set(samples, SILERO_CONTEXT_SAMPLES);

          const result = await session.run({
            input: new Tensor("float32", input, [1, input.length]),
            state: new Tensor("float32", state, [2, 1, 128]),
            sr: new Tensor("int64", new BigInt64Array([16_000n]), [1]),
          });
          const output = validOutput(result);

          state = new Float32Array(output.state);
          context = samples.slice(-SILERO_CONTEXT_SAMPLES);
          return output.probability;
        },
      };
    },
  };
}
