import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import { createMacOsRecorder } from "../src/recorder.js";

test("records five bounded seconds with fixed ffmpeg and no shell", async () => {
  const calls = [];
  const recorder = createMacOsRecorder({
    accessImpl: async (path) => {
      assert.equal(path, "/opt/homebrew/bin/ffmpeg");
    },
    tmpdirImpl: () => "/tmp",
    randomUUIDImpl: () => "test-id",
    spawnImpl: (executable, args, options) => {
      calls.push({ executable, args, options });
      const child = new EventEmitter();
      queueMicrotask(() => child.emit("close", 0));
      return child;
    },
  });

  const path = await recorder();

  assert.equal(path, "/tmp/voice-confirmation-test-id.wav");
  assert.equal(calls[0].executable, "/opt/homebrew/bin/ffmpeg");
  assert.equal(calls[0].options.shell, false);
  assert.equal(calls[0].args[calls[0].args.indexOf("-t") + 1], "5");
  assert.equal(calls[0].args.at(-1), path);
});
