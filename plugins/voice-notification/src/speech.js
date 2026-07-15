import { spawn } from "node:child_process";

export const SAY_EXECUTABLE = "/usr/bin/say";

export class SpeechError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SpeechError";
    this.code = code;
  }
}

const unavailableError = () =>
  new SpeechError("TTS_UNAVAILABLE", "Text-to-speech is unavailable.");

const failedError = () =>
  new SpeechError("TTS_FAILED", "Text-to-speech failed.");

export function runSay(speechText, { spawnImpl = spawn } = {}) {
  return new Promise((resolve, reject) => {
    let child;

    try {
      child = spawnImpl(SAY_EXECUTABLE, [speechText], {
        shell: false,
        stdio: "ignore",
      });
    } catch (error) {
      reject(error?.code === "ENOENT" ? unavailableError() : failedError());
      return;
    }

    let settled = false;
    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };

    child.once("error", (error) => {
      settle(
        reject,
        error?.code === "ENOENT" ? unavailableError() : failedError(),
      );
    });

    child.once("close", (code) => {
      if (code === 0) {
        settle(resolve);
      } else {
        settle(reject, failedError());
      }
    });
  });
}
