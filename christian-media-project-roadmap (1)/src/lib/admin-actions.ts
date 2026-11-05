"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { authors, contents, episodes, events, messages, settings, subscribers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { canPublish, COOKIE_NAME, requireUser, signSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { slugify } from "@/lib/utils";

function refresh() {
  revalidatePath("/", "layout");
}

/* ================= Authentification ================= */

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const rows = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Identifiants incorrects. Vérifiez l'adresse et le mot de passe." };
  }
  const store = await cookies();
  store.set(COOKIE_NAME, signSession(user.id), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 3600 });
  return { ok: true };
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/admin/login");
}

/* ================= Contenus ================= */

export type ContentPayload = {
  title: string; slug: string; type: string; chapo: string; body: string;
  categoryId: string; authorId: string; imageUrl: string; imageAlt: string; imageCredit: string;
  verseRef: string; verseText: string; verseTranslation: string; prayer: string; series: string;
  format: string; mediaUrl: string; anonymized: boolean; consentNote: string; sources: string;
  seoTitle: string; seoDescription: string; status: string; publishedAt: string;
};

export async function saveContent(id: number | null, p: ContentPayload): Promise<{ ok: boolean; id?: number; error?: string }> {
  const user = await requireUser();
  if (!p.title.trim()) return { ok: false, error: "Le titre est obligatoire." };
  if (!["article", "enseignement", "meditation", "temoignage"].includes(p.type)) return { ok: false, error: "Type de contenu invalide." };
  let status = p.status;
  if (!["draft", "review", "scheduled", "published", "archived"].includes(status)) status = "draft";
  if ((status === "published" || status === "scheduled") && !canPublish(user)) {
    return { ok: false, error: "Votre rôle permet de préparer et soumettre à relecture, mais pas de publier. Choisissez « À relire »." };
  }
  let publishedAt: Date | null = p.publishedAt ? new Date(p.publishedAt) : null;
  if (status === "scheduled") {
    if (!publishedAt || isNaN(publishedAt.getTime())) return { ok: false, error: "Choisissez une date de publication pour programmer ce contenu." };
    if (publishedAt.getTime() <= Date.now()) return { ok: false, error: "La date programmée doit être dans le futur (ou publiez directement)." };
  }
  if (status === "published" && !publishedAt) publishedAt = new Date();

  let slug = p.slug.trim() ? slugify(p.slug) : slugify(p.title);
  const clash = await db.select({ id: contents.id }).from(contents).where(eq(contents.slug, slug)).limit(1);
  if (clash[0] && clash[0].id !== id) slug = `${slug}-${randomUUID().slice(0, 4)}`;

  const values = {
    slug, title: p.title.trim(), type: p.type, chapo: p.chapo, body: p.body,
    categoryId: p.categoryId ? Number(p.categoryId) : null,
    authorId: p.authorId ? Number(p.authorId) : null,
    imageUrl: p.imageUrl || null, imageAlt: p.imageAlt, imageCredit: p.imageCredit,
    verseRef: p.verseRef || null, verseText: p.verseText || null, verseTranslation: p.verseTranslation || null,
    prayer: p.prayer || null, series: p.series || null,
    format: p.type === "temoignage" ? p.format || "texte" : null,
    mediaUrl: p.mediaUrl || null, anonymized: p.anonymized, consentNote: p.consentNote || null,
    sources: p.sources || null, seoTitle: p.seoTitle || null, seoDescription: p.seoDescription || null,
    status, publishedAt, updatedAt: new Date(),
  };

  let contentId = id;
  if (id) {
    await db.update(contents).set(values).where(eq(contents.id, id));
  } else {
    const [row] = await db.insert(contents).values(values).returning({ id: contents.id });
    contentId = row.id;
  }
  refresh();
  return { ok: true, id: contentId! };
}

export async function contentStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  const from = String(formData.get("from") ?? "/admin/contenus");
  if (!["draft", "review", "scheduled", "published", "archived"].includes(status)) redirect(from);
  if ((status === "published" || status === "scheduled") && !canPublish(user)) redirect(`${from}?err=droits`);
  const rows = await db.select().from(contents).where(eq(contents.id, id)).limit(1);
  if (!rows[0]) redirect(from);
  const publishedAt = status === "published" && !rows[0].publishedAt ? new Date() : rows[0].publishedAt;
  await db.update(contents).set({ status, publishedAt, updatedAt: new Date() }).where(eq(contents.id, id));
  refresh();
  redirect(`${from}${from.includes("?") ? "&" : "?"}msg=${status}`);
}

export async function deleteContentAction(formData: FormData) {
  await requireUser(["admin", "editor"]);
  const id = Number(formData.get("id"));
  await db.delete(contents).where(eq(contents.id, id));
  refresh();
  redirect("/admin/contenus?msg=supprime");
}

/* ================= Messages ================= */

export async function messageStatusAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["new", "read", "archived", "approved"].includes(status)) redirect("/admin/messages");
  await db.update(messages).set({ status }).where(eq(messages.id, id));
  revalidatePath("/admin/messages");
  redirect(`/admin/messages?msg=${status}`);
}

export async function approveTestimonyAction(formData: FormData) {
  const user = await requireUser(["admin", "editor"]);
  const id = Number(formData.get("id"));
  const rows = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  const m = rows[0];
  if (!m || m.kind !== "temoignage") redirect("/admin/messages");
  const redaction = await db.select().from(authors).where(eq(authors.slug, "la-redaction")).limit(1);
  const [row] = await db.insert(contents).values({
    slug: `temoignage-${slugify(m.name)}-${randomUUID().slice(0, 4)}`,
    type: "temoignage",
    title: `Témoignage proposé — ${m.anonymous ? "anonyme" : m.name}`,
    chapo: "Brouillon créé depuis une proposition privée. À relire avec la personne avant toute publication.",
    body: m.body,
    format: m.format ?? "texte",
    anonymized: m.anonymous,
    consentNote: `Proposition reçue via le formulaire privé le ${m.createdAt.toLocaleDateString("fr-FR")}. Accord de publication à confirmer avec ${m.name} (${m.email}) avant de publier.`,
    authorId: redaction[0]?.id ?? null,
    status: "draft",
  }).returning({ id: contents.id });
  await db.update(messages).set({ status: "approved" }).where(eq(messages.id, id));
  refresh();
  void user;
  redirect(`/admin/contenus/${row.id}?created=1`);
}

/* ================= Newsletter ================= */

export async function subscriberDeleteAction(formData: FormData) {
  await requireUser(["admin", "editor"]);
  const id = Number(formData.get("id"));
  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?msg=supprime");
}

/* ================= Réglages accueil ================= */

export async function saveHomeSettings(p: { featuredId: number | null; testimonyId: number | null; sections: { id: string; visible: boolean }[] }): Promise<{ ok: boolean }> {
  await requireUser(["admin", "editor"]);
  const upsert = async (key: string, value: string) => {
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
  };
  await upsert("featured_id", p.featuredId ? String(p.featuredId) : "");
  await upsert("featured_testimony_id", p.testimonyId ? String(p.testimonyId) : "");
  await upsert("home_sections", JSON.stringify(p.sections));
  refresh();
  return { ok: true };
}

/* ================= Auteurs ================= */

export async function authorSaveAction(formData: FormData) {
  await requireUser(["admin", "editor"]);
  const id = Number(formData.get("id")) || null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/auteurs?err=nom");
  const values = {
    name,
    slug: slugify(String(formData.get("slug") ?? "") || name),
    role: String(formData.get("role") ?? "Rédaction"),
    bio: String(formData.get("bio") ?? ""),
    color: String(formData.get("color") ?? "#0A4C9E"),
  };
  if (id) await db.update(authors).set(values).where(eq(authors.id, id));
  else await db.insert(authors).values(values);
  refresh();
  redirect("/admin/auteurs?ok=1");
}

/* ================= Épisodes ================= */

export async function episodeSaveAction(formData: FormData) {
  await requireUser(["admin", "editor"]);
  const showId = Number(formData.get("showId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title || !showId) redirect("/admin/emissions?err=titre");
  await db.insert(episodes).values({
    showId,
    title,
    slug: `${slugify(title)}-${randomUUID().slice(0, 4)}`,
    summary: String(formData.get("summary") ?? ""),
    duration: String(formData.get("duration") ?? ""),
    youtubeId: String(formData.get("youtubeId") ?? "") || null,
    audioUrl: String(formData.get("audioUrl") ?? "") || null,
    thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || null,
    transcript: String(formData.get("transcript") ?? "") || null,
    credit: String(formData.get("credit") ?? ""),
    publishedAt: new Date(),
  });
  refresh();
  redirect("/admin/emissions?ok=1");
}

export async function episodeDeleteAction(formData: FormData) {
  await requireUser(["admin", "editor"]);
  await db.delete(episodes).where(eq(episodes.id, Number(formData.get("id"))));
  refresh();
  redirect("/admin/emissions?msg=supprime");
}

/* ================= Événements ================= */

export async function eventSaveAction(formData: FormData) {
  await requireUser(["admin", "editor"]);
  const id = Number(formData.get("id")) || null;
  const title = String(formData.get("title") ?? "").trim();
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  if (!title || isNaN(startsAt.getTime())) redirect("/admin/evenements?err=champs");
  const values = {
    title,
    slug: id ? undefined : `${slugify(title)}-${randomUUID().slice(0, 4)}`,
    description: String(formData.get("description") ?? ""),
    startsAt,
    location: String(formData.get("location") ?? ""),
    city: String(formData.get("city") ?? ""),
    isOnline: formData.get("isOnline") === "on",
    organizer: String(formData.get("organizer") ?? ""),
    isOrganizerOurs: formData.get("isOrganizerOurs") === "on",
    registrationEmail: String(formData.get("registrationEmail") ?? "") || null,
    status: String(formData.get("status") ?? "published"),
  };
  if (id) {
    const { slug: _unused, ...rest } = values;
    void _unused;
    await db.update(events).set(rest).where(eq(events.id, id));
  } else {
    await db.insert(events).values(values as typeof values & { slug: string });
  }
  refresh();
  redirect("/admin/evenements?ok=1");
}

export async function eventDeleteAction(formData: FormData) {
  await requireUser(["admin", "editor"]);
  await db.delete(events).where(eq(events.id, Number(formData.get("id"))));
  refresh();
  redirect("/admin/evenements?msg=supprime");
}

/* ================= Utilisateurs ================= */

export async function userCreateAction(formData: FormData) {
  await requireUser(["admin"]);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "redacteur");
  const password = String(formData.get("password") ?? "");
  if (!email || !name || password.length < 8) redirect("/admin/utilisateurs?err=champs");
  if (!["admin", "editor", "redacteur"].includes(role)) redirect("/admin/utilisateurs?err=role");
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists[0]) redirect("/admin/utilisateurs?err=existe");
  await db.insert(users).values({ email, name, role, passwordHash: hashPassword(password) });
  redirect("/admin/utilisateurs?ok=1");
}

export async function userDeleteAction(formData: FormData) {
  const current = await requireUser(["admin"]);
  const id = Number(formData.get("id"));
  if (id === current.id) redirect("/admin/utilisateurs?err=soi");
  await db.delete(users).where(eq(users.id, id));
  redirect("/admin/utilisateurs?msg=supprime");
}