import { Shield, GitPullRequest, Languages, Wrench, Globe } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RepoCard } from "@/components/RepoCard";
import { PRHistory } from "@/components/PRHistory";
import { RepoRecord, ScanResultRecord } from "@/lib/types";

const STATS_STYLE = {
  violet: "text-violet-400",
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  amber: "text-amber-400",
} as const;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getTranslations(locale: string) {
  const tryFile = async (code: string) => {
    const fullPath = path.join(process.cwd(), "public", "locales", code, "common.json");
    const data = await readFile(fullPath, "utf-8");
    return JSON.parse(data);
  };

  try {
    return await tryFile(locale);
  } catch {
    return tryFile("en");
  }
}

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations(params.locale);
  const isRtl = params.locale === "ar";

  const supabase = getSupabase();

  let repos: RepoRecord[] = [];
  let recentScans: ScanResultRecord[] = [];

  if (supabase) {
    const [reposRes, scansRes] = await Promise.all([
      supabase.from("repos").select("*").order("updated_at", { ascending: false }),
      supabase.from("scan_results").select("*").order("scan_timestamp", { ascending: false }).limit(10),
    ]);

    repos = (reposRes.data as RepoRecord[]) || [];
    recentScans = (scansRes.data as ScanResultRecord[]) || [];
  }

  const totalScans = repos.reduce((sum, repo) => sum + (repo.total_scans || 0), 0);
  const totalFixes = repos.reduce((sum, repo) => sum + (repo.total_fixes || 0), 0);
  const avgCoverage =
    repos.length > 0
      ? Math.round(
          repos.reduce((sum, repo) => sum + (repo.latest_coverage || 0), 0) / repos.length
        )
      : 0;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-400" />
            <div>
              <h1 className="text-xl font-bold">LinguaGuard</h1>
              <p className="text-xs text-slate-500">{t.header.subtitle}</p>
            </div>
          </div>

          <LanguageSwitcher currentLocale={params.locale} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            {
              icon: GitPullRequest,
              label: t.stats.totalScans,
              value: totalScans,
              color: STATS_STYLE.violet,
            },
            {
              icon: Wrench,
              label: t.stats.autoFixes,
              value: totalFixes,
              color: STATS_STYLE.emerald,
            },
            {
              icon: Languages,
              label: t.stats.avgCoverage,
              value: `${avgCoverage}%`,
              color: STATS_STYLE.blue,
            },
            {
              icon: Globe,
              label: t.stats.repos,
              value: repos.length,
              color: STATS_STYLE.amber,
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-3 flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="text-sm text-slate-400">{label}</span>
              </div>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">{t.repos.title}</h2>
          <div className="space-y-3">
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} t={t} />
            ))}

            {repos.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                <Shield className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>{t.repos.empty}</p>
                <p className="mt-1 text-sm">{t.repos.emptyHint}</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.scans.title}</h2>
          <PRHistory scans={recentScans} t={t} />
        </section>
      </main>

      <footer className="mt-16 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-slate-500">
          {t.footer.powered} · {t.footer.hackathon}
        </div>
      </footer>
    </div>
  );
}
