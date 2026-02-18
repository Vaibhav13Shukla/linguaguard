import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

export function readJsonFile(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function writeJsonFile(filePath: string, data: Record<string, any>): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

export function flattenObject(
  obj: Record<string, any>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }

  return result;
}

export function unflattenObject(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  return result;
}

export async function findFiles(patterns: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: ["**/node_modules/**"] });
    files.push(...matches);
  }
  return [...new Set(files)];
}

export type LocaleLayout = "nested-common" | "flat";

export function detectLocaleLayout(
  localesPath: string,
  sourceLocale: string
): LocaleLayout {
  const nestedSource = path.join(localesPath, sourceLocale, "common.json");
  if (fs.existsSync(nestedSource)) return "nested-common";

  const flatSource = path.join(localesPath, `${sourceLocale}.json`);
  if (fs.existsSync(flatSource)) return "flat";

  return "nested-common";
}

export function getLocaleFilePath(
  localesPath: string,
  locale: string,
  layout: LocaleLayout
): string {
  if (layout === "flat") {
    return path.join(localesPath, `${locale}.json`);
  }
  return path.join(localesPath, locale, "common.json");
}
