import { execFile as nodeExecFile } from "node:child_process";

export const SECURITY_EXECUTABLE = "/usr/bin/security";
export const KEYCHAIN_ACCOUNT = "twilio";
export const KEYCHAIN_SERVICES = Object.freeze({
  accountSid: "codex-mobile-twilio-account-sid",
  apiKey: "codex-mobile-twilio-api-key",
  apiSecret: "codex-mobile-twilio-api-secret",
  fromNumber: "codex-mobile-twilio-from-number",
  toNumber: "codex-mobile-twilio-to-number",
});

export class CredentialError extends Error {
  constructor() {
    super("Mobile notification credentials are unavailable.");
    this.name = "CredentialError";
    this.code = "MOBILE_NOT_CONFIGURED";
  }
}

export function readKeychainItem(
  service,
  { execFileImpl = nodeExecFile } = {},
) {
  return new Promise((resolve, reject) => {
    execFileImpl(
      SECURITY_EXECUTABLE,
      [
        "find-generic-password",
        "-s",
        service,
        "-a",
        KEYCHAIN_ACCOUNT,
        "-w",
      ],
      {
        encoding: "utf8",
        shell: false,
        timeout: 5_000,
        maxBuffer: 4_096,
      },
      (error, stdout) => {
        if (error || typeof stdout !== "string" || stdout.trim().length === 0) {
          reject(new CredentialError());
          return;
        }

        resolve(stdout.trim());
      },
    );
  });
}

function validCredentials(credentials) {
  return (
    /^AC[0-9a-f]{32}$/iu.test(credentials.accountSid) &&
    /^(?:SK|RK)[0-9a-f]{32}$/iu.test(credentials.apiKey) &&
    credentials.apiSecret.length >= 16 &&
    /^\+[1-9]\d{7,14}$/u.test(credentials.fromNumber) &&
    /^\+[1-9]\d{7,14}$/u.test(credentials.toNumber)
  );
}

export async function loadCredentials({ readSecret = readKeychainItem } = {}) {
  const credentials = {};

  try {
    for (const [key, service] of Object.entries(KEYCHAIN_SERVICES)) {
      credentials[key] = await readSecret(service);
    }
  } catch {
    throw new CredentialError();
  }

  if (!validCredentials(credentials)) {
    throw new CredentialError();
  }

  return credentials;
}
