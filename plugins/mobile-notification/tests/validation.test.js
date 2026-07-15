import assert from "node:assert/strict";
import test from "node:test";

import { validateNotification } from "../src/validation.js";

test("valid input is trimmed and defaults to sms and normal", () => {
  const result = validateNotification({
    title: "  PR review needed  ",
    message: "  Please review pull request 42.  ",
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      title: "PR review needed",
      message: "Please review pull request 42.",
      channel: "sms",
      urgency: "normal",
    },
  });
});

test("exact length boundaries and urgency values are accepted", () => {
  for (const urgency of ["low", "normal", "high"]) {
    const result = validateNotification({
      title: "T".repeat(40),
      message: "M".repeat(200),
      channel: "sms",
      urgency,
    });
    assert.equal(result.ok, true);
  }
});

test("invalid shapes, extra fields, unsupported channels, and controls reject", () => {
  const cases = [
    null,
    [],
    { title: "", message: "valid" },
    { title: "valid", message: "" },
    { title: "T".repeat(41), message: "valid" },
    { title: "valid", message: "M".repeat(201) },
    { title: "valid", message: "M".repeat(301) },
    { title: "valid", message: "valid", channel: "voice" },
    { title: "valid", message: "valid", urgency: "urgent" },
    { title: "valid", message: "valid", to: "+491234567890" },
    { title: "line\nbreak", message: "valid" },
  ];

  for (const input of cases) {
    const result = validateNotification(input);
    assert.equal(result.code, "INVALID_INPUT");
  }
});

test("synthetic secrets and account identifiers reject payload-free", () => {
  const fixtures = [
    "Use password=FAKE_TEST_ONLY_12345",
    "Authorization: Bearer abcdefghijk12345",
    `Account AC${"a".repeat(32)}`,
  ];

  for (const fixture of fixtures) {
    const result = validateNotification({
      title: "Sensitive request",
      message: fixture,
    });
    assert.equal(result.code, "SENSITIVE_CONTENT");
    assert.equal(JSON.stringify(result).includes(fixture), false);
  }
});
