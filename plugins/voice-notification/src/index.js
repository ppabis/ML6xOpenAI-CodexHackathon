import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createNotifyWithConfirmation } from "./confirmation.js";
import { createGroqTranscriber } from "./groq-transcriber.js";
import { createMacOsVoiceCapture } from "./recorder.js";
import { createVoiceNotificationServer } from "./server.js";
import { createSileroVad } from "./silero-vad.js";
import { createVoiceConfirmer } from "./voice-confirmation.js";

let server;
let voiceCapture;
let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  await voiceCapture?.close();
  if (!server) {
    return;
  }

  try {
    await server.close();
  } catch {
    process.exitCode = 1;
  }
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

try {
  const { notifyUser } = await import("./notify-user.js");
  voiceCapture = createMacOsVoiceCapture({ vad: createSileroVad() });
  const confirmByVoice = createVoiceConfirmer({
    captureUtterance: voiceCapture.captureUtterance,
    transcribeAudio: createGroqTranscriber(),
  });
  const notifyWithConfirmation = createNotifyWithConfirmation({
    notifyUser,
    confirmByVoice,
  });
  server = createVoiceNotificationServer({ notifyUser: notifyWithConfirmation });
  const transport = new StdioServerTransport();
  await server.connect(transport);
} catch {
  console.error("Voice notification MCP server failed to start.");
  process.exitCode = 1;
}
