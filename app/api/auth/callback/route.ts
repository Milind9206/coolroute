import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, supabaseConfig } from "@/lib/supabase-auth";

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json() as { access_token?: string; refresh_token?: string };
    if (!access_token || !refresh_token) return NextResponse.json({ error: "The confirmation link is incomplete. Request a new one and try again." }, { status: 400 });

    const { url, anonKey } = supabaseConfig();
    const response = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "This confirmation link has expired or was already used. Request a new one." }, { status: 401 });

    const user = await response.json();
    await setSessionCookie({ access_token, refresh_token, user });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't finish confirming your email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
