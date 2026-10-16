import { cookies } from "next/headers";

const COOKIE_NAME = "coolroute-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export type AuthUser = { id: string; email: string; name: string };
export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
};

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.local.");
  return { url, anonKey };
}

function normalizeSession(value: Record<string, unknown>): SupabaseSession | null {
  const user = value.user as Record<string, unknown> | undefined;
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  if (typeof value.access_token !== "string" || typeof value.refresh_token !== "string" || typeof user?.id !== "string") return null;
  return {
    access_token: value.access_token,
    refresh_token: value.refresh_token,
    expires_at: typeof value.expires_at === "number" ? value.expires_at : Math.floor(Date.now() / 1000) + (typeof value.expires_in === "number" ? value.expires_in : 3600),
    user: {
      id: user.id,
      email: typeof user.email === "string" ? user.email : "",
      name: typeof metadata?.full_name === "string" ? metadata.full_name : (typeof user.email === "string" ? user.email : "CoolRoute user"),
    },
  };
}

export async function setSessionCookie(value: Record<string, unknown>) {
  const session = normalizeSession(value);
  if (!session) throw new Error("Authentication provider returned an invalid session.");
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return session;
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SupabaseSession | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as SupabaseSession;
    if (!session.access_token || !session.refresh_token || !session.user?.id) return null;
    if (session.expires_at > Math.floor(Date.now() / 1000) + 60) return session;

    const { url, anonKey } = supabaseConfig();
    const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
      cache: "no-store",
    });
    if (!response.ok) {
      store.delete(COOKIE_NAME);
      return null;
    }
    const renewed = await response.json() as Record<string, unknown>;
    const renewedSession = await setSessionCookie(renewed);
    return renewedSession;
  } catch {
    return null;
  }
}
