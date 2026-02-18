import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo, pr_number, scan_results, fixed_count, timestamp } = body as {
      repo: string;
      pr_number?: number;
      scan_results: {
        hardcodedStrings?: unknown[];
        missingKeys?: unknown[];
        staleTranslations?: unknown[];
        coverage?: { overall?: number; perLanguage?: Array<{ locale: string }> };
      };
      fixed_count?: number;
      timestamp?: string;
    };

    if (!repo || !scan_results) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    await supabase.from("scan_results").insert({
      repo,
      pr_number: pr_number ?? null,
      hardcoded_count: scan_results.hardcodedStrings?.length || 0,
      missing_count: scan_results.missingKeys?.length || 0,
      stale_count: scan_results.staleTranslations?.length || 0,
      fixed_count: fixed_count || 0,
      coverage_overall: scan_results.coverage?.overall || 0,
      coverage_details: scan_results.coverage?.perLanguage || [],
      scan_timestamp: timestamp || new Date().toISOString(),
    });

    const { data: existingRepo } = await supabase
      .from("repos")
      .select("total_scans,total_fixes")
      .eq("full_name", repo)
      .maybeSingle();

    await supabase.from("repos").upsert(
      {
        full_name: repo,
        latest_coverage: scan_results.coverage?.overall || 0,
        total_scans: (existingRepo?.total_scans || 0) + 1,
        total_fixes: (existingRepo?.total_fixes || 0) + (fixed_count || 0),
        languages: scan_results.coverage?.perLanguage?.map((l) => l.locale) || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "full_name" }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
