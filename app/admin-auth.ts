import { cookies } from "next/headers";

const SESSION_COOKIE = "gin_admin_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const encoder = new TextEncoder();

type AdminConfig = { password: string; sessionSecret: string };
type SessionPayload = { exp: number; scope: "admin" };

async function runtimeEnv(name: string) {
  const processValue = process.env[name]?.trim();
  if (processValue) return processValue;

  try {
    const { env } = (await import("cloudflare:workers")) as {
      env?: Record<string, unknown>;
    };
    return String(env?.[name] ?? "").trim();
  } catch {
    return "";
  }
}

async function getAdminConfig(): Promise<AdminConfig | null> {
  const [password, sessionSecret] = await Promise.all([
    runtimeEnv("ADMIN_PASSWORD"),
    runtimeEnv("ADMIN_SESSION_SECRET"),
  ]);
  if (!password || sessionSecret.length < 32) return null;
  return { password, sessionSecret };
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

function sameBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function sameSecret(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  return sameBytes(new Uint8Array(leftHash), new Uint8Array(rightHash));
}

async function parseSession(value: string | undefined, secret: string) {
  if (!value) return false;
  const [encodedPayload, signature, ...rest] = value.split(".");
  if (!encodedPayload || !signature || rest.length) return false;

  try {
    const expected = await sign(encodedPayload, secret);
    if (!(await sameSecret(signature, expected))) return false;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))) as SessionPayload;
    return payload.scope === "admin" && Number.isFinite(payload.exp) && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(cookieValue?: string) {
  const config = await getAdminConfig();
  if (!config) return false;
  return parseSession(cookieValue, config.sessionSecret);
}

export async function isCurrentAdminAuthenticated() {
  return isAdminAuthenticated((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function verifyAdminPassword(password: string) {
  const config = await getAdminConfig();
  if (!config) return { ok: false as const, configured: false };
  return { ok: await sameSecret(password, config.password), configured: true };
}

export async function createAdminSessionCookie() {
  const config = await getAdminConfig();
  if (!config) throw new Error("Admin login is not configured");
  const payload: SessionPayload = { scope: "admin", exp: Date.now() + SESSION_DURATION_MS };
  const encodedPayload = base64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload, config.sessionSecret);
  return `${SESSION_COOKIE}=${encodedPayload}.${signature}; Path=/; Max-Age=${SESSION_DURATION_MS / 1000}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function adminCookieFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const item = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return item?.slice(SESSION_COOKIE.length + 1);
}
