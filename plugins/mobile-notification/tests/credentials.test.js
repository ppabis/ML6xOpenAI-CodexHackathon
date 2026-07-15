import assert from "node:assert/strict";
import test from "node:test";

import {
  CredentialError,
  KEYCHAIN_ACCOUNT,
  KEYCHAIN_SERVICES,
  loadCredentials,
  readKeychainItem,
  SECURITY_EXECUTABLE,
} from "../src/credentials.js";

const validCredentials = {
  accountSid: `AC${"a".repeat(32)}`,
  apiKey: `SK${"b".repeat(32)}`,
  apiSecret: "fake-api-secret-value",
  fromNumber: "+15551234567",
  toNumber: "+491701234567",
};

test("readKeychainItem uses fixed executable, literal arguments, and no shell", async () => {
  let invocation;
  const value = await readKeychainItem("safe-service-name", {
    execFileImpl: (file, args, options, callback) => {
      invocation = { file, args, options };
      callback(null, "stored-value\n", "");
    },
  });

  assert.equal(value, "stored-value");
  assert.equal(invocation.file, SECURITY_EXECUTABLE);
  assert.deepEqual(invocation.args, [
    "find-generic-password",
    "-s",
    "safe-service-name",
    "-a",
    KEYCHAIN_ACCOUNT,
    "-w",
  ]);
  assert.equal(invocation.options.shell, false);
});

test("Keychain failures become generic credential errors", async () => {
  await assert.rejects(
    readKeychainItem("missing", {
      execFileImpl: (_file, _args, _options, callback) => {
        callback(new Error("private Keychain detail"), "", "");
      },
    }),
    (error) => {
      assert.equal(error instanceof CredentialError, true);
      assert.equal(error.code, "MOBILE_NOT_CONFIGURED");
      assert.equal(error.message.includes("private Keychain detail"), false);
      return true;
    },
  );
});

test("loadCredentials requests each named Keychain item and validates values", async () => {
  const requested = [];
  const byService = Object.fromEntries(
    Object.entries(KEYCHAIN_SERVICES).map(([key, service]) => [
      service,
      validCredentials[key],
    ]),
  );

  const result = await loadCredentials({
    readSecret: async (service) => {
      requested.push(service);
      return byService[service];
    },
  });

  assert.deepEqual(result, validCredentials);
  assert.deepEqual(requested, Object.values(KEYCHAIN_SERVICES));
});

test("invalid credential formats fail without exposing values", async () => {
  const exposed = "bad-private-value";
  await assert.rejects(
    loadCredentials({ readSecret: async () => exposed }),
    (error) => {
      assert.equal(error.code, "MOBILE_NOT_CONFIGURED");
      assert.equal(error.message.includes(exposed), false);
      return true;
    },
  );
});
