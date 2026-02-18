import {
  readJsonFile,
  writeJsonFile,
  flattenObject,
  unflattenObject,
  detectLocaleLayout,
  getLocaleFilePath,
} from "../utils/files";
import { MissingKey } from "../scanner/missing-keys";

interface AutoFixConfig {
  missingKeys: MissingKey[];
  localesPath: string;
  sourceLocale: string;
  lingoApiKey: string;
}

async function translateWithLingo(
  text: string,
  sourceLocale: string,
  targetLocale: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.lingo.dev/v1/localize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_locale: sourceLocale,
      target_locale: targetLocale,
      data: { text },
    }),
  });

  if (!response.ok) {
    throw new Error(`Lingo.dev API error: ${response.statusText}`);
  }

  const result = (await response.json()) as { data?: { text?: string } };
  return result.data?.text || text;
}

export async function autoFixMissing(config: AutoFixConfig): Promise<number> {
  let fixedCount = 0;
  const layout = detectLocaleLayout(config.localesPath, config.sourceLocale);

  const byLocale = new Map<string, { key: string; sourceValue: string }[]>();

  for (const missing of config.missingKeys) {
    for (const locale of missing.missingInLocales) {
      if (!byLocale.has(locale)) byLocale.set(locale, []);
      byLocale.get(locale)?.push({
        key: missing.key,
        sourceValue: missing.sourceValue,
      });
    }
  }

  for (const [locale, keys] of byLocale.entries()) {
    const localeFile = getLocaleFilePath(config.localesPath, locale, layout);
    const existingData = readJsonFile(localeFile);
    const existingFlat = flattenObject(existingData);

    for (let i = 0; i < keys.length; i += 5) {
      const batch = keys.slice(i, i + 5);

      await Promise.allSettled(
        batch.map(async ({ key, sourceValue }) => {
          const translated = await translateWithLingo(
            sourceValue,
            config.sourceLocale,
            locale,
            config.lingoApiKey
          );
          existingFlat[key] = translated;
          fixedCount += 1;
        })
      );
    }

    const updatedData = unflattenObject(existingFlat);
    writeJsonFile(localeFile, updatedData);
  }

  return fixedCount;
}
