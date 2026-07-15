import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import test from "node:test";

import { handleRequest } from "../src/server.js";

function request(id, method, params) {
  return { jsonrpc: "2.0", id, method, params };
}

test("initialize advertises the server and tool capability", async () => {
  const response = await handleRequest(
    request(1, "initialize", { protocolVersion: "2025-06-18" }),
  );

  assert.equal(response.jsonrpc, "2.0");
  assert.equal(response.id, 1);
  assert.equal(response.result.protocolVersion, "2025-06-18");
  assert.deepEqual(response.result.capabilities, { tools: {} });
  assert.deepEqual(response.result.serverInfo, {
    name: "voice-notification",
    version: "0.1.0",
  });
  assert.match(response.result.instructions, /explicit user acknowledgement/i);
});

test("tools/list exposes exactly notify_user with the locked schema", async () => {
  const response = await handleRequest(request(2, "tools/list"));

  assert.equal(response.result.tools.length, 1);
  const [tool] = response.result.tools;
  assert.equal(tool.name, "notify_user");
  assert.deepEqual(tool.inputSchema.required, ["title", "message"]);
  assert.equal(tool.inputSchema.additionalProperties, false);
  assert.deepEqual(tool.inputSchema.properties.title, {
    type: "string",
    minLength: 1,
    maxLength: 40,
    description: "Short title describing what needs attention.",
  });
  assert.equal(tool.inputSchema.properties.message.minLength, 1);
  assert.equal(tool.inputSchema.properties.message.maxLength, 200);
  assert.deepEqual(tool.inputSchema.properties.urgency.enum, [
    "low",
    "normal",
    "high",
  ]);
  assert.equal(tool.inputSchema.properties.urgency.default, "normal");
});

test("notifications without an id are ignored", async () => {
  const response = await handleRequest({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });

  assert.equal(response, undefined);
});

test("tools/call returns safe success and defaults urgency", async () => {
  const input = {
    title: "PR review",
    message: "Please review pull request 42.",
  };
  let received;
  const response = await handleRequest(
    request(3, "tools/call", {
      name: "notify_user",
      arguments: input,
    }),
    {
      notify: async (value) => {
        received = value;
        return { ok: true, status: "spoken", urgency: "normal" };
      },
    },
  );

  assert.equal(received, input);
  assert.deepEqual(response.result.structuredContent, {
    ok: true,
    status: "spoken",
    urgency: "normal",
  });
  assert.equal(response.result.isError, undefined);
  assert.equal(JSON.stringify(response).includes(input.message), false);
});

test("tools/call sanitizes payload-bearing application failures", async () => {
  const privateTitle = "Private request";
  const privateMessage = "Confidential payload that must not be echoed";
  const handlerLeak = `failure included: ${privateMessage}`;
  const response = await handleRequest(
    request(4, "tools/call", {
      name: "notify_user",
      arguments: { title: privateTitle, message: privateMessage },
    }),
    {
      notify: async () => ({
        ok: false,
        code: "SENSITIVE_CONTENT",
        error: handlerLeak,
        retryable: false,
      }),
    },
  );

  assert.equal(response.result.isError, true);
  assert.deepEqual(response.result.structuredContent, {
    ok: false,
    code: "SENSITIVE_CONTENT",
    error: "The notification request contains content that must not be spoken.",
    retryable: false,
  });
  const serialized = JSON.stringify(response);
  assert.equal(serialized.includes(privateTitle), false);
  assert.equal(serialized.includes(privateMessage), false);
  assert.equal(serialized.includes(handlerLeak), false);
});

test("unknown tools and methods return JSON-RPC errors", async () => {
  let called = false;
  const unknownTool = await handleRequest(
    request(5, "tools/call", { name: "other_tool", arguments: {} }),
    {
      notify: async () => {
        called = true;
      },
    },
  );
  const unknownMethod = await handleRequest(request(6, "resources/list"));

  assert.equal(called, false);
  assert.deepEqual(unknownTool.error, {
    code: -32602,
    message: "Unknown tool.",
  });
  assert.deepEqual(unknownMethod.error, {
    code: -32601,
    message: "Method not found.",
  });
});

test(
  "spawned server completes an initialize and tool-list JSONL handshake",
  { timeout: 5_000 },
  async (context) => {
    const serverPath = fileURLToPath(new URL("../src/server.js", import.meta.url));
    const child = spawn(process.execPath, [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    context.after(() => {
      if (child.exitCode === null) child.kill();
    });

    let diagnostics = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      diagnostics += chunk;
    });
    const lines = readline.createInterface({ input: child.stdout });
    const responses = lines[Symbol.asyncIterator]();

    child.stdin.write(
      `${JSON.stringify(request(7, "initialize", { protocolVersion: "2025-06-18" }))}\n`,
    );
    const initialized = JSON.parse((await responses.next()).value);

    child.stdin.write(`${JSON.stringify(request(8, "tools/list"))}\n`);
    const listed = JSON.parse((await responses.next()).value);

    child.stdin.end();
    await once(child, "exit");

    assert.equal(initialized.id, 7);
    assert.equal(initialized.result.serverInfo.name, "voice-notification");
    assert.deepEqual(
      listed.result.tools.map(({ name }) => name),
      ["notify_user"],
    );
    assert.equal(child.exitCode, 0);
    assert.equal(diagnostics, "");
  },
);
