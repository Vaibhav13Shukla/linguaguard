import * as fs from "fs";
import {
  readJsonFile,
  flattenObject,
  LocaleLayout,
  getLocaleFilePath,
} from "../utils/files";

export interface MissingKey {
  key: string;
  sourceValue: string;
  missingInLocales: string[];
  severity: "high" | "medium";
}

interface MissingKeysConfig {
  localesPath: string;
  sourceLocale: string;
  targetLocales: string[];
  localeLayout: LocaleLayout;
}

export function scanMissingKeys(config: MissingKeysConfig): MissingKey[] {
  const results: MissingKey[] = [];

  const sourceFile = getLocaleFilePath(
    config.localesPath,
    config.sourceLocale,
    config.localeLayout
  );
  if (!fs.existsSync(sourceFile)) return results;

  const sourceData = readJsonFile(sourceFile);
  const sourceFlat = flattenObject(sourceData);

  for (const [key, value] of Object.entries(sourceFlat)) {
    const missingIn: string[] = [];

    for (const locale of config.targetLocales) {
      const localeFile = getLocaleFilePath(
        config.localesPath,
        locale,
        config.localeLayout
      );

      if (!fs.existsSync(localeFile)) {
        missingIn.push(locale);
        continue;
      }

      const localeData = readJsonFile(localeFile);
      const localeFlat = flattenObject(localeData);

      if (!(key in localeFlat)) {
        missingIn.push(locale);
      }
    }

    if (missingIn.length > 0) {
      results.push({
        key,
        sourceValue: value,
        missingInLocales: missingIn,
        severity: missingIn.length === config.targetLocales.length ? "high" : "medium",
      });
    }
  }

  return results;
}
