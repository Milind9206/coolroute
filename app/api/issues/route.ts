import { NextRequest, NextResponse } from "next/server";
import { getSession, supabaseConfig } from "@/lib/supabase-auth";

const CATEGORIES = new Set(["Bug", "Map or route", "Weather data", "Accessibility", "Other"]);

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in before reporting an issue." }, { status: 401 });

  try {
    const { category, title, description } = await request.json() as { category?: string; title?: string; description?: string };
    const cleanTitle = title?.trim();
    const cleanDescription = description?.trim();
    if (!category || !CATEGORIES.has(category) || !cleanTitle || cleanTitle.length > 120 || !cleanDescription || cleanDescription.length < 10 || cleanDescription.length > 4000) {
      return NextResponse.json({ error: "Choose a category and provide a short title and description (10–4000 characters)." }, { status: 400 });
    }

    const { url, anonKey } = supabaseConfig();
    const response = await fetch(`${url}/rest/v1/issue_reports`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ user_id: session.user.id, category, title: cleanTitle, description: cleanDescription, page_path: new URL(request.url).searchParams.get("page")?.slice(0, 300) ?? "/planner" }),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "The report could not be saved. Please try again." }, { status: 502 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("not configured") ? error.message : "The report could not be saved. Please try again.";
    return NextResponse.json({ error: message }, { status: message.includes("not configured") ? 503 : 500 });
  }
}
