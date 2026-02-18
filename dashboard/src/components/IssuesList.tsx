export function IssuesList({
  hardcodedCount,
  missingCount,
  staleCount,
}: {
  hardcodedCount: number;
  missingCount: number;
  staleCount: number;
}) {
  return (
    <ul className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
      <li>Hardcoded strings: {hardcodedCount}</li>
      <li>Missing keys: {missingCount}</li>
      <li>Stale translations: {staleCount}</li>
    </ul>
  );
}
