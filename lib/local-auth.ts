export type LocalUser = { name: string; email: string };

async function authRequest(path: string, body?: Record<string, unknown>, method = "POST") {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({})) as { error?: string; message?: string; user?: LocalUser; confirmationRequired?: boolean };
  if (!response.ok) throw new Error(result.error ?? "We couldn't complete that request.");
  return result;
}

export async function getLocalSession(): Promise<LocalUser | null> {
  const result = await authRequest("/api/auth/session", undefined, "GET");
  return result.user ?? null;
}

export async function signUpLocal(name: string, email: string, password: string) {
  return authRequest("/api/auth/signup", { name, email, password });
}

export async function signInLocal(email: string, password: string) {
  return authRequest("/api/auth/login", { email, password });
}

export async function resendConfirmationLocal(email: string) {
  return authRequest("/api/auth/resend", { email });
}

export async function signOutLocal() {
  await authRequest("/api/auth/logout", {});
}
