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

test("initialize advertises the mobile server and acknowledgement rule", async () => {
  const response = await handleRequest(
    request(1, "initialize", { protocolVersion: "2025-06-18" }),
  );

  assert.equal(response.result.protocolVersion, "2025-06-18");
  assert.deepEqual(response.result.capabilities, { tools: {} });
  assert.deepEqual(response.result.serverInfo, {
    name: "mobile-notification",
    version: "0.1.0",
  });
  assert.match(response.result.instructions, /typed acknowledgement/iu);
});

test("tools/list exposes exactly notify_mobile with the locked SMS schema", async () => {
  const response = await handleRequest(request(2, "tools/list"));
  const [tool] = response.result.tools;

  assert.equal(response.result.tools.length, 1);
  assert.equal(tool.name, "notify_mobile");
  assert.deepEqual(tool.inputSchema.required, ["title", "message"]);
  assert.equal(tool.inputSchema.additionalProperties, false);
  assert.equal(tool.inputSchema.properties.title.maxLength, 40);
  assert.equal(tool.inputSchema.properties.message.maxLength, 200);
  assert.deepEqual(tool.inputSchema.properties.channel.enum, ["sms"]);
  assert.equal(tool.annotations.readOnlyHint, false);
  assert.equal(tool.annotations.idempotentHint, false);
});

test("tools/call returns safe queued success", async () => {
  const input = {
    title: "PR review needed",
    message: "Please review pull request 42.",
  };
  let received;
  const response = await handleRequest(
    request(3, "tools/call", {
      name: "notify_mobile",
      arguments: input,
    }),
    {
      notify: async (value) => {
        received = value;
        return {
          ok: true,
          status: "queued",
          channel: "sms",
          urgency: "normal",
        };
      },
    },
  );

  assert.equal(received, input);
  assert.deepEqual(response.result.structuredContent, {
    ok: true,
    status: "queued",
    channel: "sms",
    urgency: "normal",
  });
  assert.equal(JSON.stringify(response).includes(input.message), false);
});

test("tools/call sanitizes payload-bearing failures and thrown errors", async () => {
  const privatePayload = "Confidential payload that must not be echoed";
  for (const notify of [
    async () => ({
      ok: false,
      code: "SENSITIVE_CONTENT",
      error: privatePayload,
      retryable: false,
    }),
    async () => {
      throw new Error(privatePayload);
    },
  ]) {
    const response = await handleRequest(
      request(4, "tools/call", {
        name: "notify_mobile",
        arguments: { title: "Private", message: privatePayload },
      }),
      { notify },
    );

    assert.equal(response.result.isError, true);
    assert.equal(JSON.stringify(response).includes(privatePayload), false);
  }
});

test("unknown tools and methods return JSON-RPC errors", async () => {
  const unknownTool = await handleRequest(
    request(5, "tools/call", { name: "other_tool", arguments: {} }),
  );
  const unknownMethod = await handleRequest(request(6, "resources/list"));

  assert.equal(unknownTool.error.code, -32602);
  assert.equal(unknownMethod.error.code, -32601);
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

    assert.equal(initialized.result.serverInfo.name, "mobile-notification");
    assert.deepEqual(
      listed.result.tools.map(({ name }) => name),
      ["notify_mobile"],
    );
    assert.equal(child.exitCode, 0);
    assert.equal(diagnostics, "");
  },
);
