import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notifyUser } from "../src/notify-user.js";
import { createSayRunner, SAY_EXECUTABLE } from "../src/speech.js";

describe("notifyUser", () => {
  it("speaks valid input, defaults urgency to normal, and returns spoken", async () => {
    const calls = [];
    const result = await notifyUser(
      {
        title: "PR review needed",
        message: "Aanchal, pull request 42 is ready."
      },
      {
        runner: async (spokenText) => {
          calls.push(spokenText);
          return { ok: true };
        }
      }
    );

    assert.deepEqual(result, {
      ok: true,
      status: "spoken",
      urgency: "normal"
    });
    assert.deepEqual(calls, ["PR review needed. Aanchal, pull request 42 is ready."]);
  });

  it("accepts all supported urgency values", async () => {
    for (const urgency of ["low", "normal", "high"]) {
      const result = await notifyUser(
        {
          title: "Attention",
          message: "Please return to Codex.",
          urgency
        },
        {
          runner: async () => ({ ok: true })
        }
      );

      assert.equal(result.ok, true);
      assert.equal(result.urgency, urgency);
    }
  });

  it("rejects invalid input before calling the runner", async () => {
    const invalidCases = [
      { title: "", message: "Message" },
      { title: "Title", message: "" },
      { title: "x".repeat(41), message: "Message" },
      { title: "Title", message: "x".repeat(201) },
      { title: "Title", message: "Message", urgency: "urgent" }
    ];

    for (const input of invalidCases) {
      let called = false;
      const result = await notifyUser(input, {
        runner: async () => {
          called = true;
          return { ok: true };
        }
      });

      assert.equal(result.ok, false);
      assert.equal(result.code, "INVALID_INPUT");
      assert.equal(called, false);
    }
  });

  it("accepts exact title and message boundaries", async () => {
    const result = await notifyUser(
      {
        title: "t".repeat(40),
        message: "m".repeat(200)
      },
      {
        runner: async () => ({ ok: true })
      }
    );

    assert.equal(result.ok, true);
    assert.equal(result.status, "spoken");
  });

  it("rejects control characters before calling the runner", async () => {
    let called = false;
    const result = await notifyUser(
      {
        title: "PR review\nneeded",
        message: "Please return to Codex."
      },
      {
        runner: async () => {
          called = true;
          return { ok: true };
        }
      }
    );

    assert.equal(result.ok, false);
    assert.equal(result.code, "INVALID_INPUT");
    assert.equal(called, false);
  });

  it("rejects a known sensitive fixture before calling the runner", async () => {
    let called = false;
    const result = await notifyUser(
      {
        title: "Secret check",
        message: "Use fake token: sk-fakeTokenValue123"
      },
      {
        runner: async () => {
          called = true;
          return { ok: true };
        }
      }
    );

    assert.equal(result.ok, false);
    assert.equal(result.code, "SENSITIVE_CONTENT");
    assert.equal(called, false);
  });

  it("passes shell metacharacters as one literal say argument with shell disabled", async () => {
    const spawnCalls = [];
    const spawn = (command, args, options) => {
      spawnCalls.push({ command, args, options });
      return fakeChildProcess({ closeCode: 0 });
    };
    const runner = createSayRunner({ executable: SAY_EXECUTABLE, spawn });
    const message = 'Literal quotes "; semicolon ; and $() stay text.';

    const result = await notifyUser(
      {
        title: "Literal input",
        message
      },
      { runner }
    );

    assert.equal(result.ok, true);
    assert.equal(spawnCalls.length, 1);
    assert.equal(spawnCalls[0].command, SAY_EXECUTABLE);
    assert.deepEqual(spawnCalls[0].args, [`Literal input. ${message}`]);
    assert.equal(spawnCalls[0].options.shell, false);
  });

  it("maps a missing speech executable to TTS_UNAVAILABLE", async () => {
    const runner = createSayRunner({
      executable: "/missing/say",
      spawn: () => fakeChildProcess({ error: Object.assign(new Error("missing"), { code: "ENOENT" }) })
    });
    const result = await notifyUser(
      {
        title: "Attention",
        message: "Please return to Codex."
      },
      { runner }
    );

    assert.equal(result.ok, false);
    assert.equal(result.code, "TTS_UNAVAILABLE");
    assert.equal(result.retryable, true);
  });

  it("maps non-zero speech exit to TTS_FAILED", async () => {
    const runner = createSayRunner({
      spawn: () => fakeChildProcess({ closeCode: 1 })
    });
    const result = await notifyUser(
      {
        title: "Attention",
        message: "Please return to Codex."
      },
      { runner }
    );

    assert.equal(result.ok, false);
    assert.equal(result.code, "TTS_FAILED");
    assert.equal(result.retryable, true);
  });

  it("keeps failure results payload-free", async () => {
    const input = {
      title: "Top secret",
      message: "Please return to Codex."
    };
    const result = await notifyUser(input, {
      runner: async () => ({ ok: false, reason: "failed" })
    });
    const serialized = JSON.stringify(result);

    assert.equal(result.ok, false);
    assert.equal(serialized.includes(input.title), false);
    assert.equal(serialized.includes(input.message), false);
    assert.equal(serialized.includes(`${input.title}. ${input.message}`), false);
  });
});

function fakeChildProcess({ closeCode, error }) {
  const handlers = new Map();

  queueMicrotask(() => {
    if (error) {
      handlers.get("error")?.(error);
      return;
    }

    handlers.get("close")?.(closeCode);
  });

  return {
    once(eventName, handler) {
      handlers.set(eventName, handler);
      return this;
    }
  };
}
