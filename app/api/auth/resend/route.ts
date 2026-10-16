import { NextRequest, NextResponse } from "next/server";
import { supabaseConfig } from "@/lib/supabase-auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email?: string };
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const { url, anonKey } = supabaseConfig();
    const callbackUrl = new URL("/auth/callback", request.url).toString();
    const response = await fetch(`${url}/auth/v1/resend?redirect_to=${encodeURIComponent(callbackUrl)}`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "signup", email: cleanEmail }),
      cache: "no-store",
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({})) as { msg?: string; message?: string };
      return NextResponse.json({ error: failure.msg ?? failure.message ?? "We couldn't resend the email. Please wait a moment and try again." }, { status: response.status });
    }
    return NextResponse.json({ message: "If this account needs confirmation, a new email is on its way." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't resend the email.";
    return NextResponse.json({ error: message }, { status: message.includes("not configured") ? 503 : 500 });
  }
}
