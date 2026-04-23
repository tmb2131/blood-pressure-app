import { Octokit } from "@octokit/rest";
import type { ReadingsFile } from "./readings";

function resolveRepoString(): string | undefined {
  if (process.env.GH_REPO) return process.env.GH_REPO;
  if (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG) {
    return `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`;
  }
  return undefined;
}

export function isGitHubStorageEnabled(): boolean {
  return Boolean(process.env.GH_TOKEN && resolveRepoString());
}

function env() {
  const token = process.env.GH_TOKEN;
  const repoEnv = resolveRepoString();
  const branch =
    process.env.GH_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";
  const path = process.env.GH_PATH || "data/readings.json";
  if (!token || !repoEnv) {
    throw new Error("GH_TOKEN (and a detectable repo) must be set");
  }
  const [owner, repo] = repoEnv.split("/");
  if (!owner || !repo) throw new Error("Repo must be in owner/repo form");
  return { token, owner, repo, branch, path };
}

export async function readJson(): Promise<{ data: ReadingsFile; sha: string }> {
  const { token, owner, repo, branch, path } = env();
  const octo = new Octokit({ auth: token });
  const res = await octo.repos.getContent({ owner, repo, path, ref: branch });
  if (Array.isArray(res.data) || res.data.type !== "file") {
    throw new Error(`Expected a file at ${path}`);
  }
  const buf = Buffer.from(res.data.content, res.data.encoding as BufferEncoding);
  const parsed = JSON.parse(buf.toString("utf8")) as ReadingsFile;
  return { data: parsed, sha: res.data.sha };
}

async function writeJson(
  next: ReadingsFile,
  sha: string,
  message: string,
): Promise<void> {
  const { token, owner, repo, branch, path } = env();
  const octo = new Octokit({ auth: token });
  const content = Buffer.from(JSON.stringify(next, null, 2), "utf8").toString("base64");
  await octo.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content,
    sha,
    branch,
  });
}

export async function updateWithRetry(
  mutate: (f: ReadingsFile) => ReadingsFile,
  message: string,
): Promise<ReadingsFile> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, sha } = await readJson();
    const next = mutate(data);
    try {
      await writeJson(next, sha, message);
      return next;
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      if (status === 409 || status === 422) continue;
      throw err;
    }
  }
  throw lastErr ?? new Error("Failed to update after retries");
}
