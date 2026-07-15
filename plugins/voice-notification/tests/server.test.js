import assert from "node:assert/strict";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { createVoiceNotificationServer } from "../src/server.js";

async function createHarness(t, notifyUser) {
  const server = createVoiceNotificationServer({ notifyUser });
  const client = new Client({ name: "voice-notification-tests", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  t.after(async () => {
    await client.close();
    await server.close();
  });

  return client;
}

test("advertises exactly notify_user with the bounded input schema", async (t) => {
  const client = await createHarness(t, async () => ({
    ok: true,
    status: "spoken",
    urgency: "normal",
  }));

  const { tools } = await client.listTools();

  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, "notify_user");
  assert.deepEqual(tools[0].inputSchema.required, ["title", "message"]);
  assert.equal(tools[0].inputSchema.additionalProperties, false);
  assert.equal(tools[0].inputSchema.properties.title.type, "string");
  assert.equal(tools[0].inputSchema.properties.title.minLength, 1);
  assert.equal(tools[0].inputSchema.properties.title.maxLength, 40);
  assert.equal(tools[0].inputSchema.properties.message.type, "string");
  assert.equal(tools[0].inputSchema.properties.message.minLength, 1);
  assert.equal(tools[0].inputSchema.properties.message.maxLength, 200);
  assert.equal(tools[0].inputSchema.properties.urgency.type, "string");
  assert.deepEqual(tools[0].inputSchema.properties.urgency.enum, [
    "low",
    "normal",
    "high",
  ]);
  assert.deepEqual(tools[0].inputSchema.properties.confirmationMode.enum, [
    "text",
    "voice",
  ]);
  assert.equal(tools[0].inputSchema.properties.confirmationMode.default, "text");
  const voiceResponse = tools[0].outputSchema.oneOf.find(
    (schema) => schema.properties?.status?.const === "responded",
  );
  assert.equal(voiceResponse.properties.response.properties.method.const, "voice");
  assert.equal(voiceResponse.properties.response.properties.message.type, "string");
  assert.equal(voiceResponse.properties.response.properties.message.minLength, 1);
});

test("forwards valid arguments unchanged and returns structured success", async (t) => {
  const calls = [];
  const expected = { ok: true, status: "spoken", urgency: "high" };
  const client = await createHarness(t, async (input) => {
    calls.push(input);
    return expected;
  });
  const arguments_ = {
    title: "Review ready",
    message: "Please return to the computer.",
    urgency: "high",
  };

  const result = await client.callTool({ name: "notify_user", arguments: arguments_ });

  assert.deepEqual(calls, [arguments_]);
  assert.equal(result.isError, undefined);
  assert.deepEqual(result.structuredContent, expected);
  assert.deepEqual(JSON.parse(result.content[0].text), expected);
});

test("marks domain failures as MCP errors while retaining their safe structure", async (t) => {
  const failure = {
    ok: false,
    code: "SENSITIVE_CONTENT",
    error: "Notification content was rejected.",
    retryable: false,
  };
  const client = await createHarness(t, async () => failure);

  const result = await client.callTool({
    name: "notify_user",
    arguments: { title: "Blocked", message: "A safe summary." },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, failure);
  assert.deepEqual(JSON.parse(result.content[0].text), failure);
});

test("maps thrown handler errors to a generic payload-free failure", async (t) => {
  const secret = "super-secret-handler-detail";
  const client = await createHarness(t, async () => {
    throw new Error(secret);
  });

  const result = await client.callTool({
    name: "notify_user",
    arguments: { title: "Blocked", message: "A safe summary." },
  });

  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, {
    ok: false,
    code: "TTS_FAILED",
    error: "The voice notification could not be delivered.",
    retryable: true,
  });
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test("returns a safe structured failure for an unknown tool", async (t) => {
  const client = await createHarness(t, async () => {
    assert.fail("notifyUser must not be called for an unknown tool");
  });

  const result = await client.callTool({ name: "unknown_tool", arguments: {} });

  const expected = {
    ok: false,
    code: "INVALID_INPUT",
    error: "Unknown tool requested.",
    retryable: false,
  };
  assert.equal(result.isError, true);
  assert.deepEqual(result.structuredContent, expected);
  assert.deepEqual(JSON.parse(result.content[0].text), expected);
});
