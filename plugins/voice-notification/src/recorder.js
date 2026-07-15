import { randomUUID } from "node:crypto";
import { access, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

import {
  SILERO_FRAME_BYTES,
  SILERO_SAMPLE_RATE,
} from "./silero-vad.js";

const FFMPEG_PATHS = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"];
const FRAME_DURATION_MS = 32;

export const VAD_DEFAULTS = Object.freeze({
  onsetWindowMs: 5_000,
  trailingSilenceMs: 5_000,
  preRollMs: 500,
  maxUtteranceMs: 30_000,
  onsetThreshold: 0.65,
  continuationThreshold: 0.45,
});

async function findFfmpeg(accessImpl) {
  for (const executable of FFMPEG_PATHS) {
    try {
      await accessImpl(executable);
      return executable;
    } catch {
      // Try the next fixed location.
    }
  }
  throw new Error("Audio recording is unavailable.");
}

function framesFor(milliseconds) {
  return Math.ceil(milliseconds / FRAME_DURATION_MS);
}

export function createUtteranceEndpoint(options = {}) {
  const config = { ...VAD_DEFAULTS, ...options };
  const preRollLimit = framesFor(config.preRollMs);
  const onsetLimit = framesFor(config.onsetWindowMs);
  const silenceLimit = framesFor(config.trailingSilenceMs);
  const utteranceLimit = framesFor(config.maxUtteranceMs);
  const preRoll = [];
  const onsetProbabilities = [];
  const captured = [];
  let listeningFrames = 0;
  let utteranceFrames = 0;
  let silentFrames = 0;
  let lastSpeechFrame = -1;
  let speaking = false;
  let complete = false;

  return {
    push(frame, probability) {
      if (complete) {
        throw new Error("Voice activity endpoint is already complete.");
      }
      if (!Buffer.isBuffer(frame) || frame.length !== SILERO_FRAME_BYTES) {
        throw new TypeError("Voice activity endpoint received an invalid frame.");
      }
      if (typeof probability !== "number" || !Number.isFinite(probability)) {
        throw new TypeError("Voice activity probability is invalid.");
      }

      if (!speaking) {
        listeningFrames += 1;
        preRoll.push(Buffer.from(frame));
        if (preRoll.length > preRollLimit) {
          preRoll.shift();
        }
        onsetProbabilities.push(probability);
        if (onsetProbabilities.length > 5) {
          onsetProbabilities.shift();
        }

        const onsetVotes = onsetProbabilities.filter(
          (value) => value >= config.onsetThreshold,
        ).length;
        if (onsetVotes >= 3) {
          speaking = true;
          utteranceFrames = 1;
          captured.push(...preRoll);
          lastSpeechFrame = captured.length - 1;
          return "speaking";
        }
        if (listeningFrames >= onsetLimit) {
          complete = true;
          return "no-speech";
        }
        return "listening";
      }

      captured.push(Buffer.from(frame));
      utteranceFrames += 1;
      if (probability >= config.continuationThreshold) {
        silentFrames = 0;
        lastSpeechFrame = captured.length - 1;
      } else {
        silentFrames += 1;
      }

      if (silentFrames >= silenceLimit || utteranceFrames >= utteranceLimit) {
        complete = true;
        return "captured";
      }
      return "speaking";
    },

    audio() {
      if (!complete || lastSpeechFrame < 0) {
        return null;
      }
      return Buffer.concat(captured.slice(0, lastSpeechFrame + 1));
    },
  };
}

export function encodePcm16Wav(pcm) {
  const header = Buffer.alloc(44);
  const byteRate = SILERO_SAMPLE_RATE * 2;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SILERO_SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export function createMacOsVoiceCapture({
  vad,
  accessImpl = access,
  spawnImpl = spawn,
  writeFileImpl = writeFile,
  tmpdirImpl = tmpdir,
  randomUUIDImpl = randomUUID,
  audioDevice = ":0",
  endpointOptions,
} = {}) {
  if (!vad || typeof vad.createDetector !== "function") {
    throw new TypeError("A voice activity detector is required.");
  }

  let activeChild;
  let active = false;
  let closed = false;

  async function captureUtterance() {
    if (closed || active) {
      return { kind: "unavailable" };
    }
    active = true;
    let child;

    try {
      const [executable, detector] = await Promise.all([
        findFfmpeg(accessImpl),
        vad.createDetector(),
      ]);
      if (closed) {
        return { kind: "unavailable" };
      }

      child = spawnImpl(
        executable,
        [
          "-nostdin",
          "-loglevel",
          "error",
          "-f",
          "avfoundation",
          "-i",
          audioDevice,
          "-ar",
          String(SILERO_SAMPLE_RATE),
          "-ac",
          "1",
          "-c:a",
          "pcm_s16le",
          "-f",
          "s16le",
          "pipe:1",
        ],
        { shell: false, stdio: ["ignore", "pipe", "ignore"] },
      );
      activeChild = child;

      const processDone = new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("close", resolve);
      });
      const endpoint = createUtteranceEndpoint(endpointOptions);
      let pending = Buffer.alloc(0);
      let decision;

      for await (const chunk of child.stdout) {
        pending = Buffer.concat([pending, chunk]);
        while (pending.length >= SILERO_FRAME_BYTES) {
          const frame = pending.subarray(0, SILERO_FRAME_BYTES);
          pending = pending.subarray(SILERO_FRAME_BYTES);
          decision = endpoint.push(frame, await detector.processFrame(frame));
          if (decision === "captured" || decision === "no-speech") {
            child.kill("SIGTERM");
            break;
          }
        }
        if (decision === "captured" || decision === "no-speech") {
          break;
        }
      }

      const exitCode = await processDone;
      if (!decision) {
        throw new Error(`Audio recording stopped unexpectedly (${exitCode}).`);
      }
      if (decision === "no-speech") {
        return { kind: "no-speech" };
      }

      const pcm = endpoint.audio();
      if (!pcm?.length) {
        throw new Error("Audio recording did not contain speech.");
      }
      const audioPath = join(
        tmpdirImpl(),
        `voice-confirmation-${randomUUIDImpl()}.wav`,
      );
      await writeFileImpl(audioPath, encodePcm16Wav(pcm), { mode: 0o600 });
      return { kind: "captured", audioPath };
    } catch {
      if (child && child.exitCode === null) {
        child.kill("SIGTERM");
      }
      return { kind: "unavailable" };
    } finally {
      if (activeChild === child) {
        activeChild = undefined;
      }
      active = false;
    }
  }

  async function close() {
    closed = true;
    if (activeChild && activeChild.exitCode === null) {
      activeChild.kill("SIGTERM");
    }
  }

  return { captureUtterance, close };
}
