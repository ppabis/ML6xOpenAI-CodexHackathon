import { spawn as nodeSpawn } from "node:child_process";

export const SAY_EXECUTABLE = "/usr/bin/say";

export function createSayRunner({ executable = SAY_EXECUTABLE, spawn = nodeSpawn } = {}) {
  return function runSay(spokenText) {
    return new Promise((resolve) => {
      const child = spawn(executable, [spokenText], {
        shell: false,
        stdio: "ignore"
      });

      child.once("error", (error) => {
        if (error && error.code === "ENOENT") {
          resolve({ ok: false, reason: "unavailable" });
          return;
        }

        resolve({ ok: false, reason: "failed" });
      });

      child.once("close", (code) => {
        if (code === 0) {
          resolve({ ok: true });
          return;
        }

        resolve({ ok: false, reason: "failed" });
      });
    });
  };
}
