import * as path from "path";
import * as fs from "fs";
import { scanHardcodedStrings, HardcodedString } from "./hardcoded";
import { scanMissingKeys, MissingKey } from "./missing-keys";
import { scanStaleTranslations, StaleTranslation } from "./stale";
import {
  findFiles,
  readJsonFile,
  flattenObject,
  detectLocaleLayout,
  getLocaleFilePath,
} from "../utils/files";

export interface ScanConfig {
  changedFiles: string[];
  scanPaths: string[];
  localesPath: string;
  sourceLocale: string;
  targetLocales: string[];
  workingDirectory: string;
}

export interface CoverageInfo {
  overall: number;
  perLanguage: {
    locale: string;
    total: number;
    translated: number;
    percentage: number;
  }[];
}

export interface ScanResults {
  hardcodedStrings: HardcodedString[];
  missingKeys: MissingKey[];
  staleTranslations: StaleTranslation[];
  coverage: CoverageInfo;
  totalIssues: number;
  filesScanned: number;
}

export async function scanAll(config: ScanConfig): Promise<ScanResults> {
  const sourceFiles = await findFiles(
    config.scanPaths.map((p) => path.join(config.workingDirectory, p))
  );

  const filesToScan =
    config.changedFiles.length > 0
      ? sourceFiles.filter((f) => {
          const relative = path.relative(config.workingDirectory, f);
          return config.changedFiles.some(
            (cf) => relative === cf || relative.endsWith(cf)
          );
        })
      : sourceFiles;

  const hardcodedStrings = await scanHardcodedStrings(filesToScan);

  const localesFullPath = path.join(config.workingDirectory, config.localesPath);
  const localeLayout = detectLocaleLayout(localesFullPath, config.sourceLocale);
  const missingKeys = scanMissingKeys({
    localesPath: localesFullPath,
    sourceLocale: config.sourceLocale,
    targetLocales: config.targetLocales,
    localeLayout,
  });

  const staleTranslations = scanStaleTranslations({
    localesPath: localesFullPath,
    sourceLocale: config.sourceLocale,
    targetLocales: config.targetLocales,
    changedFiles: config.changedFiles,
    localeLayout,
  });

  const coverage = calculateCoverage({
    localesPath: localesFullPath,
    sourceLocale: config.sourceLocale,
    targetLocales: config.targetLocales,
    localeLayout,
  });

  return {
    hardcodedStrings,
    missingKeys,
    staleTranslations,
    coverage,
    totalIssues:
      hardcodedStrings.length + missingKeys.length + staleTranslations.length,
    filesScanned: filesToScan.length,
  };
}

function calculateCoverage(config: {
  localesPath: string;
  sourceLocale: string;
  targetLocales: string[];
  localeLayout: "nested-common" | "flat";
}): CoverageInfo {
  const sourceFile = getLocaleFilePath(
    config.localesPath,
    config.sourceLocale,
    config.localeLayout
  );

  if (!fs.existsSync(sourceFile)) {
    return { overall: 0, perLanguage: [] };
  }

  const sourceData = readJsonFile(sourceFile);
  const sourceKeys = Object.keys(flattenObject(sourceData));
  const totalSourceKeys = sourceKeys.length;

  if (totalSourceKeys === 0) {
    return { overall: 100, perLanguage: [] };
  }

  const perLanguage = config.targetLocales.map((locale) => {
    const localeFile = getLocaleFilePath(
      config.localesPath,
      locale,
      config.localeLayout
    );
    if (!fs.existsSync(localeFile)) {
      return { locale, total: totalSourceKeys, translated: 0, percentage: 0 };
    }

    const localeData = readJsonFile(localeFile);
    const localeKeys = Object.keys(flattenObject(localeData));
    const translated = sourceKeys.filter((k) => localeKeys.includes(k)).length;

    return {
      locale,
      total: totalSourceKeys,
      translated,
      percentage: Math.round((translated / totalSourceKeys) * 100),
    };
  });

  const overall =
    perLanguage.length > 0
      ? Math.round(
          perLanguage.reduce((sum, language) => sum + language.percentage, 0) /
            perLanguage.length
        )
      : 100;

  return { overall, perLanguage };
}
