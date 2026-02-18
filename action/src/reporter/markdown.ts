export function truncate(text: string, limit = 40): string {
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

export function stripCwd(filePath: string): string {
  const cwdPrefix = `${process.cwd()}/`;
  return filePath.startsWith(cwdPrefix) ? filePath.slice(cwdPrefix.length) : filePath;
}
