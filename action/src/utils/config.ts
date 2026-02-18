import * as core from "@actions/core";

export interface LinguaGuardConfig {
  githubToken: string;
  lingoApiKey: string;
  localesPath: string;
  sourceLocale: string;
  targetLocales: string[];
  scanPaths: string[];
  autoFix: boolean;
  failOnIssues: boolean;
}

export function loadConfig(): LinguaGuardConfig {
  const targetLocalesInput = String(
    core.getInput("target-locales") || "hi,ar,ja,de"
  );
  const scanPathsInput = String(
    core.getInput("scan-paths") || "src/**/*.tsx,src/**/*.jsx"
  );

  return {
    githubToken: core.getInput("github-token", { required: true }),
    lingoApiKey: core.getInput("lingo-api-key", { required: true }),
    localesPath: core.getInput("locales-path") || "public/locales",
    sourceLocale: core.getInput("source-locale") || "en",
    targetLocales: targetLocalesInput
      .split(",")
      .map((l: string) => l.trim())
      .filter(Boolean),
    scanPaths: scanPathsInput
      .split(",")
      .map((p: string) => p.trim())
      .filter(Boolean),
    autoFix: core.getInput("auto-fix") !== "false",
    failOnIssues: core.getInput("fail-on-issues") === "true",
  };
}
