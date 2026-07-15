import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const NOTIFY_USER_TOOL = {
  name: "notify_user",
  description:
    "Speak a short, trusted notification when a user must return to the computer to unblock work.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        minLength: 1,
        maxLength: 80,
        description: "Short description of the action that needs attention.",
      },
      message: {
        type: "string",
        minLength: 1,
        maxLength: 300,
        description: "Trusted, non-sensitive summary of what the user should do.",
      },
      urgency: {
        type: "string",
        enum: ["low", "normal", "high"],
        description: "How urgently the user should return.",
      },
    },
    required: ["title", "message"],
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    oneOf: [
      {
        properties: {
          ok: { const: true },
          status: { const: "spoken" },
          urgency: { enum: ["low", "normal", "high"] },
        },
        required: ["ok", "status", "urgency"],
        additionalProperties: false,
      },
      {
        properties: {
          ok: { const: false },
          code: {
            enum: [
              "INVALID_INPUT",
              "SENSITIVE_CONTENT",
              "TTS_UNAVAILABLE",
              "TTS_FAILED",
            ],
          },
          error: { type: "string" },
          retryable: { type: "boolean" },
        },
        required: ["ok", "code", "error", "retryable"],
        additionalProperties: false,
      },
    ],
  },
};

function toolResult(result, isError = result.ok === false) {
  return {
    content: [{ type: "text", text: JSON.stringify(result) }],
    structuredContent: result,
    ...(isError ? { isError: true } : {}),
  };
}

function safeFailure(code, error, retryable) {
  return {
    ok: false,
    code,
    error,
    retryable,
  };
}

/**
 * Create the low-level MCP server for the voice notification plugin.
 *
 * The injected domain handler remains responsible for authoritative input,
 * privacy, and process validation.
 */
export function createVoiceNotificationServer({ notifyUser }) {
  if (typeof notifyUser !== "function") {
    throw new TypeError("notifyUser must be a function");
  }

  const server = new Server(
    { name: "voice-notification", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [NOTIFY_USER_TOOL],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== NOTIFY_USER_TOOL.name) {
      return toolResult(
        safeFailure("INVALID_INPUT", "Unknown tool requested.", false),
        true,
      );
    }

    try {
      const result = await notifyUser(request.params.arguments);
      return toolResult(result);
    } catch {
      return toolResult(
        safeFailure(
          "TTS_FAILED",
          "The voice notification could not be delivered.",
          true,
        ),
        true,
      );
    }
  });

  return server;
}
