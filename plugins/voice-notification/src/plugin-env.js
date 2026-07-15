import { readFile } from "node:fs/promises";

const DEFAULT_ENV_URL = new URL("../.env", import.meta.url);

function parseGroqApiKey(contents) {
  for (const line of contents.split(/\r?\n/u)) {
    const match = /^\s*GROQ_API_KEY\s*=\s*(.*)\s*$/u.exec(line);
    if (!match) continue;

    let value = match[1].trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    return value || undefined;
  }
  return undefined;
}

export async function loadPluginEnvironment({
  env = process.env,
  readFileImpl = readFile,
  envUrl = DEFAULT_ENV_URL,
} = {}) {
  if (env.GROQ_API_KEY) return false;

  try {
    const apiKey = parseGroqApiKey(await readFileImpl(envUrl, "utf8"));
    if (!apiKey) return false;
    env.GROQ_API_KEY = apiKey;
    return true;
  } catch {
    return false;
  }
}
