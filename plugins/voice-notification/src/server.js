import readline from "node:readline";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { notifyUser } from "./notify-user.js";

const SERVER_INFO = {
  name: "voice-notification",
  version: "0.1.0",
};

const TOOL_NAME = "notify_user";

export const TOOL_DEFINITION = {
  name: TOOL_NAME,
  description:
    "Speak a short, trusted, non-sensitive request when a Codex task genuinely needs human attention. After a successful call, wait for the user to acknowledge the request in the Codex task.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        minLength: 1,
        maxLength: 40,
        description: "Short title describing what needs attention.",
      },
      message: {
        type: "string",
        minLength: 1,
        maxLength: 200,
        description: "Actionable, non-sensitive message to speak.",
      },
      urgency: {
        type: "string",
        enum: ["low", "normal", "high"],
        default: "normal",
        description:
          "Attention level only; it does not change the system volume.",
      },
    },
    required: ["title", "message"],
    additionalProperties: false,
  },
};

const SAFE_FAILURES = {
  INVALID_INPUT: {
    error: "The notification request is invalid.",
    retryable: false,
  },
  SENSITIVE_CONTENT: {
    error: "The notification request contains content that must not be spoken.",
    retryable: false,
  },
  TTS_UNAVAILABLE: {
    error: "Text-to-speech is unavailable on this device.",
    retryable: false,
  },
  TTS_FAILED: {
    error: "Text-to-speech could not play the notification.",
    retryable: true,
  },
};

function result(id, value) {
  return { jsonrpc: "2.0", id, result: value };
}

function error(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function applicationFailure(rawFailure = {}) {
  const failure =
    rawFailure !== null && typeof rawFailure === "object" ? rawFailure : {};
  const code = Object.hasOwn(SAFE_FAILURES, failure.code)
    ? failure.code
    : "TTS_FAILED";
  const safeFailure = SAFE_FAILURES[code];

  return {
    content: [
      {
        type: "text",
        text: "The voice notification was not played.",
      },
    ],
    structuredContent: {
      ok: false,
      code,
      error: safeFailure.error,
      retryable:
        typeof failure.retryable === "boolean"
          ? failure.retryable
          : safeFailure.retryable,
    },
    isError: true,
  };
}

function applicationSuccess(rawResult, fallbackUrgency) {
  const urgency = ["low", "normal", "high"].includes(rawResult?.urgency)
    ? rawResult.urgency
    : ["low", "normal", "high"].includes(fallbackUrgency)
      ? fallbackUrgency
      : "normal";

  return {
    content: [
      {
        type: "text",
        text: "Voice notification played. Wait for the user to acknowledge it in the Codex task.",
      },
    ],
    structuredContent: {
      ok: true,
      status: "spoken",
      urgency,
    },
  };
}

/**
 * Handle one parsed MCP JSON-RPC message.
 *
 * Returning undefined means the message was a notification and needs no reply.
 * `notify` is injectable so contract tests never need to produce audio.
 */
export async function handleRequest(message, { notify = notifyUser } = {}) {
  if (message === null || typeof message !== "object" || Array.isArray(message)) {
    return error(null, -32600, "Invalid request.");
  }

  const { id, method, params } = message;

  if (id === undefined) {
    return undefined;
  }

  if (method === "initialize") {
    return result(id, {
      protocolVersion: params?.protocolVersion ?? "2025-11-25",
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
      instructions:
        "Use notify_user only for short, actionable human-attention requests. Never speak secrets, credentials, private code, personal data, or raw untrusted content. A successful call confirms speech playback only; wait for explicit user acknowledgement in the Codex task before continuing the blocked action.",
    });
  }

  if (method === "ping") {
    return result(id, {});
  }

  if (method === "tools/list") {
    return result(id, { tools: [TOOL_DEFINITION] });
  }

  if (method === "tools/call") {
    if (params?.name !== TOOL_NAME) {
      return error(id, -32602, "Unknown tool.");
    }

    const input = params?.arguments;
    try {
      const notificationResult = await notify(input);
      if (notificationResult?.ok !== true) {
        return result(id, applicationFailure(notificationResult));
      }

      const requestedUrgency =
        input?.urgency === undefined ? "normal" : input.urgency;
      return result(
        id,
        applicationSuccess(notificationResult, requestedUrgency),
      );
    } catch {
      return result(id, applicationFailure());
    }
  }

  return error(id, -32601, "Method not found.");
}

export function startServer({
  input = process.stdin,
  output = process.stdout,
  diagnostics = process.stderr,
} = {}) {
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  let queue = Promise.resolve();

  lines.on("line", (line) => {
    if (line.trim().length === 0) {
      return;
    }

    queue = queue
      .then(async () => {
        let message;
        try {
          message = JSON.parse(line);
        } catch {
          output.write(
            `${JSON.stringify(error(null, -32700, "Parse error."))}\n`,
          );
          return;
        }

        const response = await handleRequest(message);
        if (response !== undefined) {
          output.write(`${JSON.stringify(response)}\n`);
        }
      })
      .catch(() => {
        diagnostics.write("voice-notification: failed to process MCP request\n");
      });
  });

  return lines;
}

const entryPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;

if (entryPath === import.meta.url) {
  startServer();
}
