import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createVoiceNotificationServer } from "./server.js";

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
  server = createVoiceNotificationServer({ notifyUser });
  const transport = new StdioServerTransport();
  await server.connect(transport);
} catch {
  console.error("Voice notification MCP server failed to start.");
  process.exitCode = 1;
}
