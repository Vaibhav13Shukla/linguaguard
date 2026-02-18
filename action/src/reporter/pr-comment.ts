import { ScanResults } from "../scanner";
import { LinguaGuardConfig } from "../utils/config";
import { stripCwd, truncate } from "./markdown";

const FLAGS: Record<string, string> = {
  en: "🇺🇸",
  hi: "🇮🇳",
  ar: "🇸🇦",
  ja: "🇯🇵",
  de: "🇩🇪",
  fr: "🇫🇷",
  es: "🇪🇸",
  pt: "🇧🇷",
  zh: "🇨🇳",
  ko: "🇰🇷",
};

interface FormatConfig {
  scanResults: ScanResults;
  fixedCount: number;
  config: LinguaGuardConfig;
}

function flag(locale: string): string {
  return FLAGS[locale] || locale;
}

export function formatPRComment(input: FormatConfig): string {
  const { scanResults, fixedCount } = input;
  const { hardcodedStrings, missingKeys, staleTranslations, coverage } = scanResults;

  const totalIssues = scanResults.totalIssues;
  const hasIssues = totalIssues > 0;

  const statusEmoji = !hasIssues ? "✅" : fixedCount >= totalIssues ? "🔧" : "⚠️";
  const statusText = !hasIssues
    ? "All clear! No i18n issues found."
    : fixedCount >= totalIssues
      ? `Found ${totalIssues} issues - all auto-fixed via Lingo.dev!`
      : `Found ${totalIssues} issues (${fixedCount} auto-fixed)`;

  let comment = `<!-- linguaguard -->
## ${statusEmoji} LinguaGuard i18n Report

${statusText}

| Metric | Count |
|--------|-------|
| 🔍 Files scanned | ${scanResults.filesScanned} |
| 🔴 Hardcoded strings | ${hardcodedStrings.length} |
| 🟡 Missing translations | ${missingKeys.length} |
| 🟠 Stale translations | ${staleTranslations.length} |
| 🔧 Auto-fixed | ${fixedCount} |
| 📊 Overall coverage | ${coverage.overall}% |

`;

  if (hardcodedStrings.length > 0) {
    comment += `### 🔴 Hardcoded Strings

These strings should use \`t()\` for translation:

| File | Line | Text | Suggested Key |
|------|------|------|---------------|
`;

    for (const item of hardcodedStrings.slice(0, 15)) {
      comment += `| \`${stripCwd(item.file)}\` | L${item.line} | "${truncate(item.text, 40)}" | \`${item.suggestedKey}\` |\n`;
    }

    if (hardcodedStrings.length > 15) {
      comment += `\n*...and ${hardcodedStrings.length - 15} more*\n`;
    }

    comment += `
<details>
<summary>How to fix</summary>

\`\`\`diff
- <button>Sign Up</button>
+ <button>{t('auth.signUp')}</button>
\`\`\`

Then add the key to your locale files or let Lingo.dev handle it.
</details>

`;
  }

  if (missingKeys.length > 0) {
    comment += `### 🟡 Missing Translation Keys

`;

    if (fixedCount > 0) {
      comment += `> ✅ **${fixedCount} keys were auto-translated via Lingo.dev** and committed to this branch.\n\n`;
    }

    const remaining = missingKeys.filter((k) => k.missingInLocales.length > 0);

    if (remaining.length > 0) {
      comment += `| Key | Missing In | Source Text |
|-----|-----------|-------------|
`;

      for (const item of remaining.slice(0, 15)) {
        const missingFlags = item.missingInLocales.map((locale) => flag(locale)).join(" ");
        comment += `| \`${item.key}\` | ${missingFlags} | "${truncate(item.sourceValue, 30)}" |\n`;
      }

      comment += "\n";
    }
  }

  if (staleTranslations.length > 0) {
    comment += `### 🟠 Potentially Stale Translations

Source locale was updated but these translations were not:

`;

    for (const item of staleTranslations) {
      comment += `- ${flag(item.locale)} **${item.locale}**: ${item.reason}\n`;
    }

    comment += "\n";
  }

  comment += `### 📊 Translation Coverage

| Language | Coverage | Status |
|----------|----------|--------|
`;

  for (const lang of coverage.perLanguage) {
    const bar =
      "#".repeat(Math.floor(lang.percentage / 5)) +
      "-".repeat(20 - Math.floor(lang.percentage / 5));
    const status = lang.percentage === 100 ? "✅" : lang.percentage >= 80 ? "🟡" : "🔴";
    comment += `| ${flag(lang.locale)} ${lang.locale.toUpperCase()} | \`${bar}\` ${lang.percentage}% | ${status} |\n`;
  }

  comment += `
---
<sub>🛡️ **LinguaGuard** - Catches broken i18n before it ships | Powered by [Lingo.dev](https://lingo.dev)</sub>
`;

  return comment;
}
