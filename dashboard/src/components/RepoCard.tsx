import { RepoRecord } from "@/lib/types";

export function RepoCard({ repo, t }: { repo: RepoRecord; t: any }) {
  const coverageColor =
    repo.latest_coverage === 100
      ? "bg-emerald-500"
      : repo.latest_coverage >= 80
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-slate-700">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold">{repo.full_name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {t.repos.scans}: {repo.total_scans} · {t.repos.fixes}: {repo.total_fixes}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full ${coverageColor}`}
              style={{ width: `${repo.latest_coverage}%` }}
            />
          </div>
          <span className="font-mono text-sm font-bold">{repo.latest_coverage}%</span>
        </div>
      </div>
    </div>
  );
}
