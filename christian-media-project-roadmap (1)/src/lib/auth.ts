import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@/db/schema";

const SECRET = process.env.AUTH_SECRET ?? "paroles-inspirees-dev-secret-change-me";
export const COOKIE_NAME = "pi_session";

export function signSession(userId: number): string {
  const payload = `${userId}.${Date.now() + 7 * 24 * 3600_000}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [uid, exp, sig] = parts;
  const expected = createHmac("sha256", SECRET).update(`${uid}.${exp}`).digest("base64url");
  if (sig !== expected) return null;
  if (Number(exp) < Date.now()) return null;
  return Number(uid);
}

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const uid = verifySession(store.get(COOKIE_NAME)?.value);
  if (!uid) return null;
  const rows = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  return rows[0] ?? null;
}

export async function requireUser(roles?: string[]): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (roles && !roles.includes(user.role)) redirect("/admin");
  return user;
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  editor: "Responsable éditorial",
  redacteur: "Rédacteur",
};

export function canPublish(user: User): boolean {
  return user.role === "admin" || user.role === "editor";
}