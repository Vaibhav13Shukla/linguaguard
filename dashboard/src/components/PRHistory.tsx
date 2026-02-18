import { ScanResultRecord } from "@/lib/types";

export function PRHistory({ scans, t }: { scans: ScanResultRecord[]; t: any }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full">
        <thead className="bg-slate-900">
          <tr className="text-left text-sm text-slate-400">
            <th className="px-4 py-3">{t.scans.repo}</th>
            <th className="px-4 py-3">{t.scans.pr}</th>
            <th className="px-4 py-3">🔴</th>
            <th className="px-4 py-3">🟡</th>
            <th className="px-4 py-3">🔧</th>
            <th className="px-4 py-3">{t.scans.coverage}</th>
            <th className="px-4 py-3">{t.scans.when}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {scans.map((scan) => (
            <tr key={scan.id} className="transition-colors hover:bg-slate-900/50">
              <td className="px-4 py-3 text-sm font-medium">{scan.repo}</td>
              <td className="px-4 py-3 text-sm">{scan.pr_number ? `#${scan.pr_number}` : "-"}</td>
              <td className="px-4 py-3 text-sm">{scan.hardcoded_count}</td>
              <td className="px-4 py-3 text-sm">{scan.missing_count}</td>
              <td className="px-4 py-3 text-sm text-emerald-400">{scan.fixed_count}</td>
              <td className="px-4 py-3 font-mono text-sm">{scan.coverage_overall}%</td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {new Date(scan.scan_timestamp).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
