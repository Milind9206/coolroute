import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, supabaseConfig } from "@/lib/supabase-auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json() as { name?: string; email?: string; password?: string };
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 80 || !cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !password || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Enter a valid name, email, and password with at least 8 characters." }, { status: 400 });
    }

    const { url, anonKey } = supabaseConfig();
    const callbackUrl = new URL("/auth/callback", request.url).toString();
    const response = await fetch(`${url}/auth/v1/signup?redirect_to=${encodeURIComponent(callbackUrl)}`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password, data: { full_name: cleanName } }),
      cache: "no-store",
    });
    const result = await response.json() as Record<string, unknown>;
    if (!response.ok) return NextResponse.json({ error: typeof result.msg === "string" ? result.msg : typeof result.message === "string" ? result.message : "We couldn't create that account." }, { status: response.status });

    if (typeof result.access_token !== "string") {
      return NextResponse.json({ confirmationRequired: true, message: "Check your email to confirm your account, then sign in." });
    }
    const session = await setSessionCookie(result);
    return NextResponse.json({ user: { name: session.user.name, email: session.user.email } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't create that account.";
    return NextResponse.json({ error: message }, { status: message.includes("not configured") ? 503 : 500 });
  }
}
