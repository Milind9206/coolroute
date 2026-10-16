import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, supabaseConfig } from "@/lib/supabase-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json() as { email?: string; password?: string };
    if (!email?.trim() || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    const { url, anonKey } = supabaseConfig();
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      cache: "no-store",
    });
    const result = await response.json() as Record<string, unknown>;
    if (!response.ok) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    const session = await setSessionCookie(result);
    return NextResponse.json({ user: { name: session.user.name, email: session.user.email } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't sign in.";
    return NextResponse.json({ error: message }, { status: message.includes("not configured") ? 503 : 500 });
  }
}
