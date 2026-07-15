import assert from "node:assert/strict";
import test from "node:test";

import { loadPluginEnvironment } from "../src/plugin-env.js";

test("loads only supported keys from the plugin-local env file", async () => {
  const env = {};
  const loaded = await loadPluginEnvironment({
    env,
    readFileImpl: async (_url, encoding) => {
      assert.equal(encoding, "utf8");
      return [
        "OTHER_SECRET=ignored",
        "GROQ_API_KEY='groq-key'",
        'ELEVENLABS_API_KEY="eleven-key"',
      ].join("\n");
    },
  });

  assert.equal(loaded, true);
  assert.deepEqual(env, {
    GROQ_API_KEY: "groq-key",
    ELEVENLABS_API_KEY: "eleven-key",
  });
});

test("host environment wins and a complete environment avoids file reads", async () => {
  const env = {
    GROQ_API_KEY: "host-groq-key",
    ELEVENLABS_API_KEY: "host-eleven-key",
  };
  let reads = 0;
  const loaded = await loadPluginEnvironment({
    env,
    readFileImpl: async () => {
      reads += 1;
      return "GROQ_API_KEY=plugin-key\nELEVENLABS_API_KEY=plugin-eleven-key";
    },
  });

  assert.equal(loaded, false);
  assert.equal(reads, 0);
  assert.deepEqual(env, {
    GROQ_API_KEY: "host-groq-key",
    ELEVENLABS_API_KEY: "host-eleven-key",
  });
});

test("loads a missing key without overriding a host key", async () => {
  const env = { GROQ_API_KEY: "host-groq-key" };
  assert.equal(
    await loadPluginEnvironment({
      env,
      readFileImpl: async () =>
        "GROQ_API_KEY=plugin-groq-key\nELEVENLABS_API_KEY=plugin-eleven-key",
    }),
    true,
  );
  assert.deepEqual(env, {
    GROQ_API_KEY: "host-groq-key",
    ELEVENLABS_API_KEY: "plugin-eleven-key",
  });
});

test("missing or empty plugin env files fail closed", async () => {
  for (const readFileImpl of [
    async () => "GROQ_API_KEY=\nELEVENLABS_API_KEY=",
    async () => {
      throw new Error("missing");
    },
  ]) {
    const env = {};
    assert.equal(await loadPluginEnvironment({ env, readFileImpl }), false);
    assert.deepEqual(env, {});
  }
});
