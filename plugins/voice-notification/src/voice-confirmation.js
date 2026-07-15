import { unlink } from "node:fs/promises";

export function createVoiceConfirmer({
  captureUtterance,
  transcribeAudio,
  deleteAudio = unlink,
}) {
  if (
    typeof captureUtterance !== "function" ||
    typeof transcribeAudio !== "function"
  ) {
    throw new TypeError("Voice response dependencies must be functions");
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
      if (
        typeof transcript !== "string" ||
        !/[\p{L}\p{N}]/u.test(transcript)
      ) {
        return "unavailable";
      }
      return { kind: "responded", message: transcript.trim() };
    } catch {
      return "unavailable";
    } finally {
      if (audioPath) {
        await deleteAudio(audioPath).catch(() => {});
      }
    }
  };
}
