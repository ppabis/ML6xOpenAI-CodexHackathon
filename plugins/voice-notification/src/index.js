import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createNotifyWithConfirmation } from "./confirmation.js";
import { createGroqTranscriber } from "./groq-transcriber.js";
import { createMacOsRecorder } from "./recorder.js";
import { createVoiceNotificationServer } from "./server.js";
import { createVoiceConfirmer } from "./voice-confirmation.js";

let server;
let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
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
  const confirmByVoice = createVoiceConfirmer({
    recordAudio: createMacOsRecorder(),
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
