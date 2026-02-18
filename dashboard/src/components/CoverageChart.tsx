import { CoverageLanguage } from "@/lib/types";

export function CoverageChart({ coverage }: { coverage: CoverageLanguage[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-300">Coverage by Language</h3>
      <div className="space-y-3">
        {coverage.map((lang) => (
          <div key={lang.locale} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="uppercase text-slate-400">{lang.locale}</span>
              <span className="font-mono">{lang.percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${lang.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
