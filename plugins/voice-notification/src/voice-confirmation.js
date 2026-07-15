import { unlink } from "node:fs/promises";

import { classifyConfirmation } from "./confirmation.js";

export function createVoiceConfirmer({
  captureUtterance,
  transcribeAudio,
  deleteAudio = unlink,
}) {
  if (
    typeof captureUtterance !== "function" ||
    typeof transcribeAudio !== "function"
  ) {
    throw new TypeError("Voice confirmation dependencies must be functions");
  }

  return async function confirmByVoice() {
    let audioPath;
    try {
      const capture = await captureUtterance();
      if (capture?.kind !== "captured" || typeof capture.audioPath !== "string") {
        return "unavailable";
      }
      audioPath = capture.audioPath;
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
