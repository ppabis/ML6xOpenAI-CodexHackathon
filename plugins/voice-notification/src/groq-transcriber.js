import { readFile } from "node:fs/promises";

export const GROQ_TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";
const GROQ_TRANSCRIPTION_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";

export function createGroqTranscriber({
  fetchImpl = globalThis.fetch,
  readFileImpl = readFile,
  apiKeyProvider = () => process.env.GROQ_API_KEY,
} = {}) {
  return async function transcribeAudio(audioPath) {
    const apiKey = apiKeyProvider();
    if (!apiKey) {
      throw new Error("Groq API key is unavailable.");
    }

    const audio = await readFileImpl(audioPath);
    const form = new FormData();
    form.append("file", new Blob([audio], { type: "audio/wav" }), "confirmation.wav");
    form.append("model", GROQ_TRANSCRIPTION_MODEL);
    form.append("response_format", "json");
    form.append("temperature", "0");

    const response = await fetchImpl(GROQ_TRANSCRIPTION_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error("Groq transcription failed.");
    }

    const payload = await response.json();
    if (typeof payload?.text !== "string") {
      throw new Error("Groq transcription returned an invalid response.");
    }
    return payload.text;
  };
}
