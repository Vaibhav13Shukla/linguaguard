import * as core from "@actions/core";
import * as github from "@actions/github";
import { scanAll } from "./scanner";
import { formatPRComment } from "./reporter/pr-comment";
import { autoFixMissing } from "./fixer/auto-translate";
import { commitFixes } from "./fixer/commit-fix";
import { getChangedFiles } from "./utils/git";
import { loadConfig } from "./utils/config";

async function run(): Promise<void> {
  try {
    const config = loadConfig();
    core.info("LinguaGuard - scanning for i18n issues...");
    core.info(`Source locale: ${config.sourceLocale}`);
    core.info(`Target locales: ${config.targetLocales.join(", ")}`);
    core.info(`Locales path: ${config.localesPath}`);
    core.info(`Auto-fix: ${config.autoFix}`);

    const context = github.context;
    const octokit = github.getOctokit(config.githubToken);

    let changedFiles: string[] = [];

    if (context.payload.pull_request) {
      const { data: files } = await octokit.rest.pulls.listFiles({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.payload.pull_request.number,
      });
      changedFiles = files.map((f: { filename: string }) => f.filename);
      core.info(`Changed files in PR: ${changedFiles.length}`);
    } else {
      changedFiles = await getChangedFiles();
      core.info(`Changed files in push: ${changedFiles.length}`);
    }

    const scanResults = await scanAll({
      changedFiles,
      scanPaths: config.scanPaths,
      localesPath: config.localesPath,
      sourceLocale: config.sourceLocale,
      targetLocales: config.targetLocales,
      workingDirectory: process.cwd(),
    });

    core.info("Scan results:");
    core.info(`Hardcoded strings: ${scanResults.hardcodedStrings.length}`);
    core.info(`Missing keys: ${scanResults.missingKeys.length}`);
    core.info(`Stale translations: ${scanResults.staleTranslations.length}`);
    core.info(`Coverage: ${scanResults.coverage.overall}%`);

    let fixedCount = 0;
    if (config.autoFix && scanResults.missingKeys.length > 0) {
      core.info("Auto-fixing missing translations via Lingo.dev...");
      fixedCount = await autoFixMissing({
        missingKeys: scanResults.missingKeys,
        localesPath: config.localesPath,
        sourceLocale: config.sourceLocale,
        lingoApiKey: config.lingoApiKey,
      });
      core.info(`Fixed ${fixedCount} missing translations`);

      if (fixedCount > 0 && context.payload.pull_request) {
        await commitFixes({
          context,
          message: `LinguaGuard: Auto-translated ${fixedCount} missing keys via Lingo.dev`,
          localesPath: config.localesPath,
        });
        core.info("Committed fixes to PR branch");
      }
    }

    if (context.payload.pull_request) {
      const comment = formatPRComment({
        scanResults,
        fixedCount,
        config,
      });

      const { data: comments } = await octokit.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.pull_request.number,
      });

      const existingComment = comments.find((c: { body?: string | null }) =>
        c.body?.includes("<!-- linguaguard -->")
      );

      if (existingComment) {
        await octokit.rest.issues.updateComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: existingComment.id,
          body: comment,
        });
        core.info("Updated existing PR comment");
      } else {
        await octokit.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: context.payload.pull_request.number,
          body: comment,
        });
        core.info("Posted new PR comment");
      }
    }

    const dashboardUrl = process.env.LINGUAGUARD_DASHBOARD_URL;
    if (dashboardUrl) {
      try {
        await fetch(`${dashboardUrl}/api/webhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo: `${context.repo.owner}/${context.repo.repo}`,
            pr_number: context.payload.pull_request?.number,
            scan_results: scanResults,
            fixed_count: fixedCount,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        core.warning("Could not send results to dashboard");
      }
    }

    core.setOutput("issues-found", scanResults.totalIssues);
    core.setOutput("fixed-count", fixedCount);
    core.setOutput("coverage", scanResults.coverage.overall);

    const totalRemaining = scanResults.totalIssues - fixedCount;
    if (config.failOnIssues && totalRemaining > 0) {
      core.setFailed(`LinguaGuard found ${totalRemaining} unresolved i18n issues`);
      return;
    }

    if (scanResults.totalIssues > 0) {
      core.warning(
        `LinguaGuard found ${scanResults.totalIssues} issues (${fixedCount} auto-fixed)`
      );
      return;
    }

    core.info("No i18n issues found. Your code is clean.");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`LinguaGuard failed: ${error.message}`);
      return;
    }
    core.setFailed("LinguaGuard failed with an unknown error");
  }
}

run();
