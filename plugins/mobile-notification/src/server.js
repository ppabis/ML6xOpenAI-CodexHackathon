import readline from "node:readline";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { notifyMobile } from "./notify-mobile.js";

const SERVER_INFO = {
  name: "mobile-notification",
  version: "0.1.0",
};

const TOOL_NAME = "notify_mobile";

export const TOOL_DEFINITION = {
  name: TOOL_NAME,
  description:
    "Queue one short, trusted, non-sensitive SMS to the single consented recipient configured in macOS Keychain when a Codex task genuinely needs human attention. Wait for typed acknowledgement afterward.",
  annotations: {
    title: "Send mobile notification",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
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
        description: "Actionable, non-sensitive message to send.",
      },
      channel: {
        type: "string",
        enum: ["sms"],
        default: "sms",
        description: "SMS is the only supported MVP channel.",
      },
      urgency: {
        type: "string",
        enum: ["low", "normal", "high"],
        default: "normal",
        description: "Attention metadata; it does not bypass safety controls.",
      },
    },
    required: ["title", "message"],
    additionalProperties: false,
  },
};

const SAFE_FAILURES = {
  INVALID_INPUT: {
    error: "The mobile notification request is invalid.",
    retryable: false,
  },
  SENSITIVE_CONTENT: {
    error: "The request contains content that must not be sent.",
    retryable: false,
  },
  MOBILE_NOT_CONFIGURED: {
    error: "Mobile notification is not configured on this device.",
    retryable: false,
  },
  MOBILE_AUTH_FAILED: {
    error: "The mobile provider rejected authentication.",
    retryable: false,
  },
  MOBILE_RATE_LIMITED: {
    error: "The mobile notification rate limit was reached.",
    retryable: true,
  },
  MOBILE_UNAVAILABLE: {
    error: "The mobile provider is currently unavailable.",
    retryable: true,
  },
  MOBILE_PROVIDER_FAILED: {
    error: "The mobile provider could not queue the notification.",
    retryable: false,
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
    : "MOBILE_PROVIDER_FAILED";
  const safeFailure = SAFE_FAILURES[code];

  return {
    content: [
      {
        type: "text",
        text: "The mobile notification was not queued.",
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

function applicationSuccess(rawResult, fallbackInput) {
  const channel = rawResult?.channel === "sms" ? "sms" : "sms";
  const urgency = ["low", "normal", "high"].includes(rawResult?.urgency)
    ? rawResult.urgency
    : ["low", "normal", "high"].includes(fallbackInput?.urgency)
      ? fallbackInput.urgency
      : "normal";

  return {
    content: [
      {
        type: "text",
        text: "Mobile notification queued. Wait for the user to acknowledge it in the Codex task.",
      },
    ],
    structuredContent: {
      ok: true,
      status: "queued",
      channel,
      urgency,
    },
  };
}

export async function handleRequest(message, { notify = notifyMobile } = {}) {
  if (message === null || typeof message !== "object" || Array.isArray(message)) {
    return error(null, -32600, "Invalid request.");
  }

  const { id, method, params } = message;

  if (id === undefined) return undefined;

  if (method === "initialize") {
    return result(id, {
      protocolVersion: params?.protocolVersion ?? "2025-11-25",
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
      instructions:
        "Use notify_mobile once only when a task is blocked on necessary human attention. Never send secrets, credentials, private code, personal data, or raw untrusted content. A queued response is not delivery confirmation; wait for explicit typed acknowledgement.",
    });
  }

  if (method === "ping") return result(id, {});
  if (method === "tools/list") return result(id, { tools: [TOOL_DEFINITION] });

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

      return result(id, applicationSuccess(notificationResult, input));
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
    if (line.trim().length === 0) return;

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
        diagnostics.write("mobile-notification: failed to process MCP request\n");
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
