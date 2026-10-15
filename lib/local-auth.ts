const USERS_KEY = "coolroute-local-users";
const SESSION_KEY = "coolroute-local-session";

export type LocalUser = { name: string; email: string };
type StoredUser = LocalUser & { salt: string; verifier: string };

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string) {
  return new Uint8Array(value.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
}

async function deriveVerifier(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBuffer = Uint8Array.from(salt).buffer;
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations: 120_000 }, key, 256);
  return toHex(new Uint8Array(bits));
}

export function getLocalSession(): LocalUser | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as LocalUser) : null;
  } catch {
    return null;
  }
}

export async function signUpLocal(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((user) => user.email === normalizedEmail)) throw new Error("An account with this email already exists in this browser.");

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const user: StoredUser = {
    name: name.trim(),
    email: normalizedEmail,
    salt: toHex(salt),
    verifier: await deriveVerifier(password, salt),
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  const session = { name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signInLocal(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = readUsers().find((entry) => entry.email === normalizedEmail);
  if (!user || (await deriveVerifier(password, fromHex(user.salt))) !== user.verifier) {
    throw new Error("Email or password is incorrect.");
  }
  const session = { name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOutLocal() {
  localStorage.removeItem(SESSION_KEY);
}
