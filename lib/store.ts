import { promises as fs } from "node:fs";
import path from "node:path";
import * as gh from "./github";
import type { ReadingsFile } from "./readings";

const useGitHub = gh.isGitHubStorageEnabled();
const LOCAL_PATH = path.join(process.cwd(), "data", "readings.json");

async function readLocal(): Promise<ReadingsFile> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_PATH, "utf8"));
  } catch {
    return { version: 1, readings: [] };
  }
}

async function writeLocal(next: ReadingsFile): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
}

export async function readAll(): Promise<ReadingsFile> {
  if (useGitHub) return (await gh.readJson()).data;
  return readLocal();
}

export async function updateWithRetry(
  mutate: (f: ReadingsFile) => ReadingsFile,
  message: string,
): Promise<ReadingsFile> {
  if (useGitHub) return gh.updateWithRetry(mutate, message);
  const cur = await readLocal();
  const next = mutate(cur);
  await writeLocal(next);
  return next;
}

export function storageMode(): "github" | "local" {
  return useGitHub ? "github" : "local";
}
