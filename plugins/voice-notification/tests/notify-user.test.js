import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import { notifyUser } from "../src/notify-user.js";
import { runSay, SAY_EXECUTABLE } from "../src/speech.js";

const validInput = {
  title: "PR review needed",
  message: "Please review pull request 42.",
};

const succeed = async () => {};

function serializationDoesNotContain(result, ...payloads) {
  const serialized = JSON.stringify(result);
  for (const payload of payloads) {
    assert.equal(serialized.includes(payload), false);
  }
}

test("valid input is trimmed, spoken, and defaults urgency to normal", async () => {
  const spoken = [];
  const result = await notifyUser(
    { title: "  PR review needed  ", message: "  Please review PR 42.  " },
    { speechRunner: async (text) => spoken.push(text) },
  );

  assert.deepEqual(spoken, ["PR review needed. Please review PR 42."]);
  assert.deepEqual(result, { ok: true, status: "spoken", urgency: "normal" });
});

test("exact 40-character title and 200-character message are accepted", async () => {
  const result = await notifyUser(
    { title: "T".repeat(40), message: "M".repeat(200) },
    { speechRunner: succeed },
  );

  assert.equal(result.ok, true);
});

test("title 41 and message 201 or 301 are rejected without speech", async () => {
  for (const input of [
    { title: "T".repeat(41), message: "valid" },
    { title: "valid", message: "M".repeat(201) },
    { title: "valid", message: "M".repeat(301) },
  ]) {
    let calls = 0;
    const result = await notifyUser(input, {
      speechRunner: async () => {
        calls += 1;
      },
    });

    assert.equal(result.code, "INVALID_INPUT");
    assert.equal(calls, 0);
  }
});

test("empty, non-string, invalid urgency, and control characters reject before speech", async () => {
  const cases = [
    { title: " ", message: "valid" },
    { title: "valid", message: "\t" },
    { title: 42, message: "valid" },
    { title: "valid", message: null },
    { ...validInput, urgency: "urgent" },
    { ...validInput, unexpected: true },
    { title: "line\nbreak", message: "valid" },
    { title: "valid", message: "nul\u0000byte" },
  ];

  for (const input of cases) {
    let called = false;
    const result = await notifyUser(input, {
      speechRunner: async () => {
        called = true;
      },
    });
    assert.equal(result.code, "INVALID_INPUT");
    assert.equal(called, false);
  }
});

test("low, normal, and high urgency are metadata and do not change speech", async () => {
  for (const urgency of ["low", "normal", "high"]) {
    const spoken = [];
    const result = await notifyUser(
      { ...validInput, urgency },
      { speechRunner: async (text) => spoken.push(text) },
    );

    assert.equal(result.urgency, urgency);
    assert.deepEqual(spoken, [
      "PR review needed. Please review pull request 42.",
    ]);
  }
});

test("synthetic secret assignments and bearer tokens are rejected without speech", async () => {
  const fixtures = [
    "Use password=FAKE_TEST_ONLY_12345",
    "Authorization: Bearer abcdefghijk12345",
    "Use api_key: fake-key-value",
  ];

  for (const fixture of fixtures) {
    let called = false;
    const result = await notifyUser(
      { title: "Sensitive request", message: fixture },
      {
        speechRunner: async () => {
          called = true;
        },
      },
    );

    assert.equal(result.code, "SENSITIVE_CONTENT");
    assert.equal(called, false);
    serializationDoesNotContain(result, fixture, "Sensitive request");
  }
});

test("runSay uses fixed executable, one literal argument, and no shell", async () => {
  const literal = 'Review "PR"; $(touch /tmp/voice-pwn) && echo $HOME';
  let invocation;
  const child = new EventEmitter();
  const promise = runSay(literal, {
    spawnImpl: (executable, args, options) => {
      invocation = { executable, args, options };
      queueMicrotask(() => child.emit("close", 0));
      return child;
    },
  });

  await promise;
  assert.equal(invocation.executable, SAY_EXECUTABLE);
  assert.deepEqual(invocation.args, [literal]);
  assert.equal(invocation.options.shell, false);
});

test("runSay does not resolve merely because the process spawned", async () => {
  const child = new EventEmitter();
  let completed = false;
  const promise = runSay("Title. Message", {
    spawnImpl: () => child,
  }).then(() => {
    completed = true;
  });

  await Promise.resolve();
  assert.equal(completed, false);
  child.emit("close", 0);
  await promise;
  assert.equal(completed, true);
});

test("missing say and non-zero exit map to distinct payload-free failures", async () => {
  const secretTitle = "Private request";
  const secretMessage = "Confidential demo payload";
  const unavailable = await notifyUser(
    { title: secretTitle, message: secretMessage },
    {
      speechRunner: async () => {
        const error = new Error(secretMessage);
        error.code = "TTS_UNAVAILABLE";
        throw error;
      },
    },
  );
  const failed = await notifyUser(
    { title: secretTitle, message: secretMessage },
    {
      speechRunner: async () => {
        throw new Error(secretMessage);
      },
    },
  );

  assert.deepEqual(unavailable, {
    ok: false,
    code: "TTS_UNAVAILABLE",
    error: "Text-to-speech is unavailable.",
    retryable: false,
  });
  assert.deepEqual(failed, {
    ok: false,
    code: "TTS_FAILED",
    error: "Text-to-speech failed.",
    retryable: false,
  });
  serializationDoesNotContain(
    unavailable,
    secretTitle,
    secretMessage,
    `${secretTitle}. ${secretMessage}`,
  );
  serializationDoesNotContain(
    failed,
    secretTitle,
    secretMessage,
    `${secretTitle}. ${secretMessage}`,
  );
});

test("runSay maps ENOENT and non-zero close without exposing speech", async () => {
  const speech = "Private request. Confidential demo payload";
  const enoentChild = new EventEmitter();
  const unavailable = runSay(speech, {
    spawnImpl: () => {
      queueMicrotask(() => {
        const error = new Error(speech);
        error.code = "ENOENT";
        enoentChild.emit("error", error);
      });
      return enoentChild;
    },
  });
  const failedChild = new EventEmitter();
  const failed = runSay(speech, {
    spawnImpl: () => {
      queueMicrotask(() => failedChild.emit("close", 1));
      return failedChild;
    },
  });

  await assert.rejects(unavailable, (error) => {
    assert.equal(error.code, "TTS_UNAVAILABLE");
    assert.equal(error.message.includes(speech), false);
    return true;
  });
  await assert.rejects(failed, (error) => {
    assert.equal(error.code, "TTS_FAILED");
    assert.equal(error.message.includes(speech), false);
    return true;
  });
});
