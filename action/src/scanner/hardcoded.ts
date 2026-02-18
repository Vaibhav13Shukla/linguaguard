import { Project, SourceFile, SyntaxKind } from "ts-morph";
import * as path from "path";

export interface HardcodedString {
  file: string;
  line: number;
  column: number;
  text: string;
  type: "jsx-text" | "jsx-attribute";
  suggestedKey: string;
  severity: "high" | "medium";
}

const IGNORE_PATTERNS = [
  /^https?:\/\//,
  /^\//,
  /^#[0-9a-fA-F]/,
  /^\d+(\.\d+)?$/,
  /^[a-z][a-zA-Z]+$/,
  /^(div|span|p|h[1-6]|button|input|form|section|main|header|footer|nav|img|a|ul|li)$/i,
  /^(className|onClick|onChange|onSubmit|href|src|alt|id|key|ref|type|name|value|style|data-)$/,
  /^(get|post|put|delete|patch)$/i,
  /^(true|false|null|undefined)$/,
  /^\s*$/,
  /^[{}()[\]<>,.:;]+$/,
  /\.(tsx?|jsx?|css|json|svg|png|jpg|webp|ico|woff)$/,
  /^(flex|grid|block|none|auto|inherit|relative|absolute|fixed)$/,
  /^(sm|md|lg|xl|2xl):/,
  /^(text-|bg-|border-|rounded-|p-|m-|w-|h-|flex-)/,
];

const USER_FACING_ATTRS = ["placeholder", "title", "aria-label", "alt", "label"];

function shouldIgnore(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2) return true;
  if (trimmed.length > 200) return true;
  return IGNORE_PATTERNS.some((p) => p.test(trimmed));
}

function generateKey(text: string, filePath: string): string {
  const fileName = path.basename(filePath, path.extname(filePath));
  const section = fileName.charAt(0).toLowerCase() + fileName.slice(1);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3);

  const keyPart = words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");

  return `${section}.${keyPart || "text"}`;
}

function getLocation(sourceFile: SourceFile, pos: number): { line: number; column: number } {
  return sourceFile.getLineAndColumnAtPos(pos);
}

export async function scanHardcodedStrings(files: string[]): Promise<HardcodedString[]> {
  const results: HardcodedString[] = [];

  const project = new Project({
    compilerOptions: {
      jsx: 4,
      allowJs: true,
      noEmit: true,
    },
    skipAddingFilesFromTsConfig: true,
  });

  for (const file of files) {
    if (!/\.(tsx|jsx)$/.test(file)) continue;

    try {
      const sourceFile = project.addSourceFileAtPath(file);

      sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach((node) => {
        const text = node.getText().trim();
        if (shouldIgnore(text)) return;
        const loc = getLocation(sourceFile, node.getPos());

        results.push({
          file,
          line: loc.line,
          column: loc.column,
          text,
          type: "jsx-text",
          suggestedKey: generateKey(text, file),
          severity: "high",
        });
      });

      sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach((attr) => {
        const name = attr.getNameNode().getText();
        if (!USER_FACING_ATTRS.includes(name)) return;

        const init = attr.getInitializer();
        if (!init || init.getKind() !== SyntaxKind.StringLiteral) return;

        const text = init.getText().replace(/^"|"$/g, "");
        if (shouldIgnore(text)) return;
        const loc = getLocation(sourceFile, attr.getPos());

        results.push({
          file,
          line: loc.line,
          column: loc.column,
          text,
          type: "jsx-attribute",
          suggestedKey: generateKey(text, file),
          severity: "medium",
        });
      });

      project.removeSourceFile(sourceFile);
    } catch {
      // Skip unparseable files.
    }
  }

  return results;
}
