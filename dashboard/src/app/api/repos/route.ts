import { NextResponse } from "next/server";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("repos")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ repos: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 });
  }
}
