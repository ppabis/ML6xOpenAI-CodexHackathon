import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const SAY_EXECUTABLE = "/usr/bin/say";
export const AFPLAY_EXECUTABLE = "/usr/bin/afplay";
export const ELEVENLABS_MODEL = "eleven_flash_v2_5";
export const ELEVENLABS_VOICE_NAME = "Sarah";
export const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

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

function waitForSuccessfulExit(child) {
  return new Promise((resolve, reject) => {
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
      settle(code === 0 ? resolve : reject, code === 0 ? undefined : failedError());
    });
  });
}

export function runSay(speechText, { spawnImpl = spawn } = {}) {
  let child;
  try {
    child = spawnImpl(SAY_EXECUTABLE, [speechText], {
      shell: false,
      stdio: "ignore",
    });
  } catch (error) {
    return Promise.reject(
      error?.code === "ENOENT" ? unavailableError() : failedError(),
    );
  }
  return waitForSuccessfulExit(child);
}

export function createElevenLabsSpeechRunner({
  fetchImpl = globalThis.fetch,
  spawnImpl = spawn,
  writeFileImpl = writeFile,
  unlinkImpl = unlink,
  tmpdirImpl = tmpdir,
  randomUUIDImpl = randomUUID,
} = {}) {
  return async function runElevenLabs(speechText, apiKey) {
    if (!apiKey) throw unavailableError();

    let audioPath;
    try {
      const response = await fetchImpl(
        `${ELEVENLABS_TTS_URL}/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: speechText,
            model_id: ELEVENLABS_MODEL,
            language_code: "en",
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );
      if (!response.ok) throw failedError();

      const audio = Buffer.from(await response.arrayBuffer());
      if (audio.length === 0) throw failedError();
      audioPath = join(
        tmpdirImpl(),
        `voice-notification-${randomUUIDImpl()}.mp3`,
      );
      await writeFileImpl(audioPath, audio, { mode: 0o600 });

      let child;
      try {
        child = spawnImpl(AFPLAY_EXECUTABLE, [audioPath], {
          shell: false,
          stdio: "ignore",
        });
      } catch (error) {
        throw error?.code === "ENOENT" ? unavailableError() : failedError();
      }
      await waitForSuccessfulExit(child);
    } catch (error) {
      if (error instanceof SpeechError) throw error;
      throw failedError();
    } finally {
      if (audioPath) await unlinkImpl(audioPath).catch(() => {});
    }
  };
}

export function createSpeechRunner({
  apiKeyProvider = () => process.env.ELEVENLABS_API_KEY,
  elevenLabsRunner = createElevenLabsSpeechRunner(),
  sayRunner = runSay,
} = {}) {
  return async function speak(speechText) {
    const apiKey = apiKeyProvider();
    if (!apiKey) return sayRunner(speechText);
    return elevenLabsRunner(speechText, apiKey);
  };
}

export const runSpeech = createSpeechRunner();
