import assert from "node:assert/strict";
import test from "node:test";

import { createRateLimiter } from "../src/rate-limit.js";

test("rate limiter allows one request per minute", () => {
  let current = 0;
  const limiter = createRateLimiter({ now: () => current });

  assert.equal(limiter.take(), true);
  assert.equal(limiter.take(), false);
  current = 60_000;
  assert.equal(limiter.take(), true);
});

test("rate limiter allows at most five requests per rolling hour", () => {
  let current = 0;
  const limiter = createRateLimiter({ now: () => current });

  for (let count = 0; count < 5; count += 1) {
    assert.equal(limiter.take(), true);
    current += 60_000;
  }

  assert.equal(limiter.take(), false);
  current = 3_600_000;
  assert.equal(limiter.take(), true);
});
