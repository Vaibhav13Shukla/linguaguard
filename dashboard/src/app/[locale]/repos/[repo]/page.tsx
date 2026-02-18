import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { ScanResultRecord } from "@/lib/types";

export default async function RepoDetailPage({
  params,
}: {
  params: { locale: string; repo: string };
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 text-white">
        <h1 className="text-2xl font-bold">Repository Details</h1>
        <p className="mt-2 text-slate-400">Set Supabase environment variables to view repo history.</p>
      </main>
    );
  }

  const supabase = createClient(url, key);
  const fullRepoName = decodeURIComponent(params.repo);

  const { data: repo } = await supabase
    .from("repos")
    .select("*")
    .eq("full_name", fullRepoName)
    .maybeSingle();

  if (!repo) notFound();

  const { data: scans } = await supabase
    .from("scan_results")
    .select("*")
    .eq("repo", fullRepoName)
    .order("scan_timestamp", { ascending: false })
    .limit(30);
  const typedScans = ((scans as ScanResultRecord[]) || []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-white">
      <a href={`/${params.locale}`} className="text-sm text-indigo-300 hover:text-indigo-200">
        ← Back
      </a>
      <h1 className="mt-4 text-3xl font-bold">{repo.full_name}</h1>
      <p className="mt-2 text-slate-400">Latest coverage: {repo.latest_coverage}%</p>

      <div className="mt-8 space-y-3">
        {typedScans.map((scan) => (
          <div key={scan.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              {new Date(scan.scan_timestamp).toLocaleString()} · PR {scan.pr_number ?? "-"}
            </p>
            <p className="mt-1 text-sm">
              Hardcoded: {scan.hardcoded_count} · Missing: {scan.missing_count} · Stale: {scan.stale_count} · Fixed: {scan.fixed_count}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
