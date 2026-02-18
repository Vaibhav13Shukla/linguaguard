import * as exec from "@actions/exec";
import * as github from "@actions/github";
import * as fs from "fs";

interface CommitConfig {
  context: typeof github.context;
  message: string;
  localesPath: string;
}

export async function commitFixes(config: CommitConfig): Promise<void> {
  const prBranch = config.context.payload.pull_request?.head.ref;
  if (!prBranch) return;

  await exec.exec("git", [
    "config",
    "user.email",
    "linguaguard-bot@users.noreply.github.com",
  ]);
  await exec.exec("git", ["config", "user.name", "LinguaGuard Bot"]);

  if (fs.existsSync(config.localesPath)) {
    await exec.exec("git", ["add", config.localesPath]);
  }

  let hasChanges = false;
  try {
    await exec.exec("git", ["diff", "--staged", "--quiet"]);
  } catch {
    hasChanges = true;
  }

  if (!hasChanges) return;

  await exec.exec("git", ["commit", "-m", config.message]);
  await exec.exec("git", ["push", "origin", `HEAD:${prBranch}`]);
}
