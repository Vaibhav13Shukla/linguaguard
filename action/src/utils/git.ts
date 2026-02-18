import * as exec from "@actions/exec";

export async function getChangedFiles(): Promise<string[]> {
  let output = "";

  await exec.exec("git", ["diff", "--name-only", "HEAD~1", "HEAD"], {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
    silent: true,
  });

  return output
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
}

export async function getCurrentBranch(): Promise<string> {
  let output = "";

  await exec.exec("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
    silent: true,
  });

  return output.trim();
}
