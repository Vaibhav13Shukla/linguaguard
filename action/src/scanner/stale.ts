import * as fs from "fs";
import * as path from "path";
import { LocaleLayout, getLocaleFilePath } from "../utils/files";

export interface StaleTranslation {
  key: string;
  locale: string;
  reason: string;
  severity: "medium";
}

interface StaleConfig {
  localesPath: string;
  sourceLocale: string;
  targetLocales: string[];
  changedFiles: string[];
  localeLayout: LocaleLayout;
}

export function scanStaleTranslations(config: StaleConfig): StaleTranslation[] {
  const results: StaleTranslation[] = [];

  const sourceFileSuffix =
    config.localeLayout === "flat"
      ? `${config.sourceLocale}.json`
      : path.join(config.sourceLocale, "common.json");
  const sourceWasChanged = config.changedFiles.some(
    (file) => file.includes(sourceFileSuffix) || file.includes(sourceFileSuffix.replace("/", "\\"))
  );

  if (!sourceWasChanged) return results;

  for (const locale of config.targetLocales) {
    const localeSuffix =
      config.localeLayout === "flat"
        ? `${locale}.json`
        : path.join(locale, "common.json");
    const localeWasChanged = config.changedFiles.some(
      (file) => file.includes(localeSuffix) || file.includes(localeSuffix.replace("/", "\\"))
    );

    if (localeWasChanged) continue;

    const localeFile = getLocaleFilePath(
      config.localesPath,
      locale,
      config.localeLayout
    );
    if (!fs.existsSync(localeFile)) continue;

    results.push({
      key: "*",
      locale,
      reason: `Source locale (${config.sourceLocale}) was updated but ${locale} translations were not`,
      severity: "medium",
    });
  }

  return results;
}
