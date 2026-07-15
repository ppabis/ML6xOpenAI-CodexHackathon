import { readFile } from "node:fs/promises";

const DEFAULT_ENV_URL = new URL("../.env", import.meta.url);
const ALLOWED_KEYS = ["GROQ_API_KEY", "ELEVENLABS_API_KEY"];

function parseEnvironment(contents) {
  const parsed = {};
  for (const line of contents.split(/\r?\n/u)) {
    const match = /^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/u.exec(line);
    if (!match) continue;
    const [, key] = match;
    if (!ALLOWED_KEYS.includes(key)) continue;

    let value = match[2].trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    if (value) parsed[key] = value;
  }
  return parsed;
}

export async function loadPluginEnvironment({
  env = process.env,
  readFileImpl = readFile,
  envUrl = DEFAULT_ENV_URL,
} = {}) {
  if (ALLOWED_KEYS.every((key) => env[key])) return false;

  try {
    const parsed = parseEnvironment(await readFileImpl(envUrl, "utf8"));
    let loaded = false;
    for (const key of ALLOWED_KEYS) {
      if (!env[key] && parsed[key]) {
        env[key] = parsed[key];
        loaded = true;
      }
    }
    return loaded;
  } catch {
    return false;
  }
}
