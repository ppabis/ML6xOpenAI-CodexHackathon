import { unlink } from "node:fs/promises";

import { classifyConfirmation } from "./confirmation.js";

export function createVoiceConfirmer({
  recordAudio,
  transcribeAudio,
  deleteAudio = unlink,
}) {
  if (typeof recordAudio !== "function" || typeof transcribeAudio !== "function") {
    throw new TypeError("Voice confirmation dependencies must be functions");
  }

  return async function confirmByVoice() {
    let audioPath;
    try {
      audioPath = await recordAudio();
      const transcript = await transcribeAudio(audioPath);
      return classifyConfirmation(transcript);
    } catch {
      return "unavailable";
    } finally {
      if (audioPath) {
        await deleteAudio(audioPath).catch(() => {});
      }
    }
  };
}
