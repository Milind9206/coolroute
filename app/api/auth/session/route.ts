import { NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-auth";

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({ user: session ? { name: session.user.name, email: session.user.email } : null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
