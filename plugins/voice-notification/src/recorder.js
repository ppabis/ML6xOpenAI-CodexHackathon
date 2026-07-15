import { randomUUID } from "node:crypto";
import { access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const FFMPEG_PATHS = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"];

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

export function createMacOsRecorder({
  accessImpl = access,
  spawnImpl = spawn,
  tmpdirImpl = tmpdir,
  randomUUIDImpl = randomUUID,
  audioDevice = ":0",
} = {}) {
  return async function recordConfirmation() {
    const executable = await findFfmpeg(accessImpl);
    const audioPath = join(
      tmpdirImpl(),
      `voice-confirmation-${randomUUIDImpl()}.wav`,
    );
    const args = [
      "-nostdin",
      "-loglevel",
      "error",
      "-f",
      "avfoundation",
      "-i",
      audioDevice,
      "-t",
      "5",
      "-ar",
      "16000",
      "-ac",
      "1",
      "-c:a",
      "pcm_s16le",
      audioPath,
    ];

    await new Promise((resolve, reject) => {
      const child = spawnImpl(executable, args, {
        shell: false,
        stdio: "ignore",
      });
      child.once("error", reject);
      child.once("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error("Audio recording failed."));
        }
      });
    });

    return audioPath;
  };
}
