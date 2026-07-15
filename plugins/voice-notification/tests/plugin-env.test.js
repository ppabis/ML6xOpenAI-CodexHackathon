import assert from "node:assert/strict";
import test from "node:test";

import { loadPluginEnvironment } from "../src/plugin-env.js";

test("loads only the Groq key from the plugin-local env file", async () => {
  const env = {};
  const loaded = await loadPluginEnvironment({
    env,
    readFileImpl: async (_url, encoding) => {
      assert.equal(encoding, "utf8");
      return "OTHER_SECRET=ignored\nGROQ_API_KEY='plugin-key'\n";
    },
  });

  assert.equal(loaded, true);
  assert.deepEqual(env, { GROQ_API_KEY: "plugin-key" });
});

test("host environment wins and the plugin file is not read", async () => {
  const env = { GROQ_API_KEY: "host-key" };
  let reads = 0;
  const loaded = await loadPluginEnvironment({
    env,
    readFileImpl: async () => {
      reads += 1;
      return "GROQ_API_KEY=plugin-key";
    },
  });

  assert.equal(loaded, false);
  assert.equal(reads, 0);
  assert.equal(env.GROQ_API_KEY, "host-key");
});

test("missing or empty plugin env files fail closed", async () => {
  for (const readFileImpl of [
    async () => "GROQ_API_KEY=",
    async () => {
      throw new Error("missing");
    },
  ]) {
    const env = {};
    assert.equal(await loadPluginEnvironment({ env, readFileImpl }), false);
    assert.deepEqual(env, {});
  }
});
