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
    if (!response.ok) {
      const providerError = result as { code?: string; error_code?: string; msg?: string; message?: string };
      const unconfirmed = [providerError.code, providerError.error_code, providerError.msg, providerError.message].some((value) => typeof value === "string" && /email not confirmed|email_not_confirmed|user_not_confirmed/i.test(value));
      return NextResponse.json({ error: unconfirmed ? "Please confirm your email before signing in." : "Email or password is incorrect.", confirmationRequired: unconfirmed }, { status: unconfirmed ? 403 : 401 });
    }
    const session = await setSessionCookie(result);
    return NextResponse.json({ user: { name: session.user.name, email: session.user.email } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't sign in.";
    return NextResponse.json({ error: message }, { status: message.includes("not configured") ? 503 : 500 });
  }
}
