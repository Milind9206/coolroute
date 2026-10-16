import { NextResponse } from "next/server";
import { clearSessionCookie, getSession, supabaseConfig } from "@/lib/supabase-auth";

export async function POST() {
  const session = await getSession();
  if (session) {
    try {
      const { url, anonKey } = supabaseConfig();
      await fetch(`${url}/auth/v1/logout`, { method: "POST", headers: { apikey: anonKey, Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
    } catch { /* The local session still gets cleared if the provider is unreachable. */ }
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
