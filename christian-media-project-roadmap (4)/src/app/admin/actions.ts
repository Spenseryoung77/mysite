"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  authors, categories, contactMessages, contents, events, settings, shows, subscribers, testimonySubmissions, users,
} from "@/db/schema";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import { CONTENT_TYPES, HOME_SECTIONS, ROLES, STATUSES, can, slugify, type HomeSectionKey } from "@/lib/site";

export type AdminState = { ok: boolean; message: string } | null;

const s = (f: FormData, k: string, max = 20000) => String(f.get(k) ?? "").trim().slice(0, max);
const n = (f: FormData, k: string) => { const v = Number(f.get(k)); return Number.isFinite(v) && v > 0 ? v : null; };
const orNull = (v: string) => (v ? v : null);
const b = (f: FormData, k: string) => f.get(k) === "on";

/* ---------- Auth ---------- */
const attempts = new Map<string, { count: number; until: number }>();

export async function loginAction(_: AdminState, form: FormData): Promise<AdminState> {
  await ensureSeed();
  const email = s(form, "email", 200).toLowerCase();
  const password = s(form, "password", 200);
  const a = attempts.get(email);
  if (a && a.until > Date.now()) return { ok: false, message: "Trop de tentatives. Réessayez dans quelques minutes." };
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u || !u.active || !verifyPassword(password, u.passwordHash)) {
    const count = (a?.count ?? 0) + 1;
    attempts.set(email, { count, until: count >= 5 ? Date.now() + 10 * 60 * 1000 : 0 });
    return { ok: false, message: "Identifiants incorrects." };
  }
  attempts.delete(email);
  await createSession(u.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Contenus ---------- */
export async function saveContentAction(_: AdminState, form: FormData): Promise<AdminState> {
  const user = await requireUser();
  const id = n(form, "id");
  const type = s(form, "type");
  if (!CONTENT_TYPES.includes(type as never)) return { ok: false, message: "Type de contenu invalide." };

  let existing: typeof contents.$inferSelect | undefined;
  if (id) {
    [existing] = await db.select().from(contents).where(eq(contents.id, id)).limit(1);
    if (!existing) return { ok: false, message: "Contenu introuvable." };
    if (!can(user.role, "editAll")) {
      if (existing.createdById !== user.id) return { ok: false, message: "Vous ne pouvez modifier que vos propres contenus." };
      if (!["brouillon", "relecture"].includes(existing.status))
        return { ok: false, message: "Ce contenu a été validé : seul un responsable éditorial peut le modifier." };
    }
  }

  let status = s(form, "status") || "brouillon";
  if (!(status in STATUSES)) status = "brouillon";
  if (!can(user.role, "publish") && !["brouillon", "relecture"].includes(status)) {
    if (existing && existing.status === status) {
      // gestionnaire média : conserve le statut existant
    } else {
      return { ok: false, message: "Votre rôle ne permet pas de valider ou publier. Choisissez « Brouillon » ou « À relire »." };
    }
  }

  const title = s(form, "title", 300);
  if (!title) return { ok: false, message: "Le titre est obligatoire." };
  const slug = slugify(s(form, "slug", 120) || title);
  if (!slug) return { ok: false, message: "Adresse (slug) invalide." };
  const dup = await db.select({ id: contents.id }).from(contents)
    .where(id ? and(eq(contents.slug, slug), ne(contents.id, id)) : eq(contents.slug, slug)).limit(1);
  if (dup[0]) return { ok: false, message: "Cette adresse (slug) est déjà utilisée par un autre contenu." };

  const pub = s(form, "publishedAt");
  let publishedAt: Date | null = pub ? new Date(pub) : existing?.publishedAt ?? null;
  if (publishedAt && Number.isNaN(publishedAt.getTime())) publishedAt = null;
  if (status === "publie" && !publishedAt) publishedAt = new Date();

  const values = {
    type,
    slug,
    title,
    excerpt: orNull(s(form, "excerpt", 600)),
    body: s(form, "body", 100000),
    status,
    publishedAt,
    authorId: n(form, "authorId"),
    categoryId: n(form, "categoryId"),
    showId: n(form, "showId"),
    imageUrl: orNull(s(form, "imageUrl", 1000)),
    imageAlt: orNull(s(form, "imageAlt", 300)),
    imageCredit: orNull(s(form, "imageCredit", 300)),
    sources: orNull(s(form, "sources", 5000)),
    correction: orNull(s(form, "correction", 2000)),
    nature: s(form, "nature") || "fait",
    bibleRef: orNull(s(form, "bibleRef", 200)),
    bibleTranslation: orNull(s(form, "bibleTranslation", 200)),
    prayer: orNull(s(form, "prayer", 5000)),
    mediaFormat: s(form, "mediaFormat") || "texte",
    mediaUrl: orNull(s(form, "mediaUrl", 1000)),
    duration: orNull(s(form, "duration", 40)),
    transcript: orNull(s(form, "transcript", 100000)),
    anonymized: b(form, "anonymized"),
    consentVerified: b(form, "consentVerified"),
    seoTitle: orNull(s(form, "seoTitle", 200)),
    seoDescription: orNull(s(form, "seoDescription", 400)),
    updatedAt: new Date(),
  };

  if (values.imageUrl && !values.imageAlt) return { ok: false, message: "Ajoutez un texte alternatif pour l’image (accessibilité)." };
  if (values.mediaUrl && !/^https:\/\//.test(values.mediaUrl)) return { ok: false, message: "L’URL du média doit commencer par https://" };
  if (values.imageUrl && !/^(https:\/\/|\/)/.test(values.imageUrl)) return { ok: false, message: "L’URL de l’image doit commencer par https:// ou /" };

  if (status === "publie" || status === "valide") {
    if (!values.authorId) return { ok: false, message: "Avant validation : un auteur (ou « La rédaction ») doit être identifié." };
    if (values.bibleRef && !values.bibleTranslation) return { ok: false, message: "Indiquez la traduction biblique utilisée pour la référence citée." };
    if (type === "temoignage" && !values.consentVerified) return { ok: false, message: "Un témoignage ne peut être validé sans accord vérifié de la personne concernée." };
    if (type === "episode" && !values.mediaUrl) return { ok: false, message: "Un épisode doit avoir une URL de média autorisée." };
    if (values.imageUrl && !values.imageCredit) return { ok: false, message: "Renseignez le crédit de l’image avant publication." };
    if (!values.body && type !== "episode") return { ok: false, message: "Le texte est vide." };
  }

  let savedId = id;
  if (id) {
    await db.update(contents).set(values).where(eq(contents.id, id));
  } else {
    const [row] = await db.insert(contents).values({ ...values, createdById: user.id }).returning({ id: contents.id });
    savedId = row.id;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/contenus/${savedId}?ok=1`);
}

export async function deleteContentAction(form: FormData) {
  await requireUser("publish");
  const id = n(form, "id");
  if (id) await db.delete(contents).where(eq(contents.id, id));
  revalidatePath("/", "layout");
  redirect("/admin/contenus");
}

/* ---------- Accueil ---------- */
export async function saveHomeAction(form: FormData) {
  await requireUser("homepage");
  const keys = Object.keys(HOME_SECTIONS) as HomeSectionKey[];
  const order = keys
    .map((key) => ({ key, visible: b(form, `visible_${key}`), pos: Number(form.get(`order_${key}`)) || 99 }))
    .sort((a, c) => a.pos - c.pos)
    .map(({ key, visible }) => ({ key, visible }));
  const value = { order, featuredId: n(form, "featuredId"), testimonyId: n(form, "testimonyId") };
  await db.insert(settings).values({ key: "home", value }).onConflictDoUpdate({ target: settings.key, set: { value } });
  revalidatePath("/");
  redirect("/admin/accueil?ok=1");
}

/* ---------- Rubriques, auteurs, émissions ---------- */
export async function saveCategoryAction(form: FormData) {
  await requireUser("taxonomy");
  const name = s(form, "name", 100);
  const section = s(form, "section");
  if (!name || !CONTENT_TYPES.includes(section as never)) redirect("/admin/rubriques?err=1");
  await db.insert(categories).values({
    name, section, slug: slugify(s(form, "slug") || name), sortOrder: Number(form.get("sortOrder")) || 0,
    description: orNull(s(form, "description", 500)),
  }).onConflictDoNothing();
  revalidatePath("/", "layout");
  redirect("/admin/rubriques?ok=1");
}

export async function deleteCategoryAction(form: FormData) {
  await requireUser("taxonomy");
  const id = n(form, "id");
  if (id) {
    await db.update(contents).set({ categoryId: null }).where(eq(contents.categoryId, id));
    await db.delete(categories).where(eq(categories.id, id));
  }
  revalidatePath("/", "layout");
  redirect("/admin/rubriques");
}

export async function saveAuthorAction(form: FormData) {
  await requireUser("taxonomy");
  const id = n(form, "id");
  const name = s(form, "name", 120);
  if (!name) redirect("/admin/rubriques?err=1");
  const v = {
    name, slug: slugify(s(form, "slug") || name), title: orNull(s(form, "title", 200)),
    bio: orNull(s(form, "bio", 2000)), photoUrl: orNull(s(form, "photoUrl", 1000)),
  };
  if (id) await db.update(authors).set(v).where(eq(authors.id, id));
  else await db.insert(authors).values(v).onConflictDoNothing();
  revalidatePath("/", "layout");
  redirect("/admin/rubriques?ok=1#auteurs");
}

export async function deleteAuthorAction(form: FormData) {
  await requireUser("taxonomy");
  const id = n(form, "id");
  if (id) {
    await db.update(contents).set({ authorId: null }).where(eq(contents.authorId, id));
    await db.delete(authors).where(eq(authors.id, id));
  }
  redirect("/admin/rubriques#auteurs");
}

export async function saveShowAction(form: FormData) {
  await requireUser("taxonomy");
  const id = n(form, "id");
  const title = s(form, "title", 200);
  if (!title) redirect("/admin/rubriques?err=1");
  const v = {
    title, slug: slugify(s(form, "slug") || title), description: orNull(s(form, "description", 2000)),
    host: orNull(s(form, "host", 200)), format: s(form, "format") === "podcast" ? "podcast" : "video",
    imageUrl: orNull(s(form, "imageUrl", 1000)),
  };
  if (id) await db.update(shows).set(v).where(eq(shows.id, id));
  else await db.insert(shows).values(v).onConflictDoNothing();
  revalidatePath("/", "layout");
  redirect("/admin/rubriques?ok=1#emissions");
}

export async function deleteShowAction(form: FormData) {
  await requireUser("taxonomy");
  const id = n(form, "id");
  if (id) {
    await db.update(contents).set({ showId: null }).where(eq(contents.showId, id));
    await db.delete(shows).where(eq(shows.id, id));
  }
  redirect("/admin/rubriques#emissions");
}

/* ---------- Événements ---------- */
export async function saveEventAction(form: FormData) {
  await requireUser("events");
  const id = n(form, "id");
  const title = s(form, "title", 200);
  const startsAt = new Date(s(form, "startsAt"));
  if (!title || Number.isNaN(startsAt.getTime())) redirect(`/admin/evenements?err=1`);
  const v = {
    title, slug: slugify(s(form, "slug") || `${title}-${startsAt.toISOString().slice(0, 10)}`),
    description: orNull(s(form, "description", 5000)), startsAt, timezone: s(form, "timezone") || "Europe/Paris",
    location: orNull(s(form, "location", 300)), onlineUrl: orNull(s(form, "onlineUrl", 1000)),
    organizer: orNull(s(form, "organizer", 200)), contact: orNull(s(form, "contact", 300)),
    registrationUrl: orNull(s(form, "registrationUrl", 1000)), isOrganizer: b(form, "isOrganizer"),
    status: ["actif", "annule", "archive"].includes(s(form, "status")) ? s(form, "status") : "actif",
    published: b(form, "published"),
  };
  if (id) await db.update(events).set(v).where(eq(events.id, id));
  else await db.insert(events).values(v).onConflictDoNothing();
  revalidatePath("/", "layout");
  redirect("/admin/evenements?ok=1");
}

export async function deleteEventAction(form: FormData) {
  await requireUser("events");
  const id = n(form, "id");
  if (id) await db.delete(events).where(eq(events.id, id));
  revalidatePath("/", "layout");
  redirect("/admin/evenements");
}

/* ---------- Messages ---------- */
export async function toggleMessageAction(form: FormData) {
  await requireUser("messages");
  const id = n(form, "id");
  if (id) await db.update(contactMessages).set({ handled: b(form, "handled") }).where(eq(contactMessages.id, id));
  redirect("/admin/messages");
}
export async function deleteMessageAction(form: FormData) {
  await requireUser("messages");
  const id = n(form, "id");
  if (id) await db.delete(contactMessages).where(eq(contactMessages.id, id));
  redirect("/admin/messages");
}
export async function submissionStatusAction(form: FormData) {
  await requireUser("messages");
  const id = n(form, "id");
  const status = s(form, "status");
  if (id && ["nouveau", "en_cours", "retenu", "refuse"].includes(status))
    await db.update(testimonySubmissions).set({ status }).where(eq(testimonySubmissions.id, id));
  redirect("/admin/messages#temoignages");
}
export async function deleteSubmissionAction(form: FormData) {
  await requireUser("messages");
  const id = n(form, "id");
  if (id) await db.delete(testimonySubmissions).where(eq(testimonySubmissions.id, id));
  redirect("/admin/messages#temoignages");
}
export async function submissionToDraftAction(form: FormData) {
  const user = await requireUser("messages");
  const id = n(form, "id");
  if (!id) redirect("/admin/messages");
  const [sub] = await db.select().from(testimonySubmissions).where(eq(testimonySubmissions.id, id)).limit(1);
  if (!sub) redirect("/admin/messages");
  const [row] = await db.insert(contents).values({
    type: "temoignage", status: "brouillon", title: sub.title,
    slug: `${slugify(sub.title)}-${sub.id}`, body: sub.story, anonymized: sub.wantsAnonymity,
    consentVerified: false, createdById: user.id, mediaFormat: "texte",
  }).returning({ id: contents.id });
  await db.update(testimonySubmissions).set({ status: "en_cours" }).where(eq(testimonySubmissions.id, id));
  redirect(`/admin/contenus/${row.id}`);
}
export async function deleteSubscriberAction(form: FormData) {
  await requireUser("messages");
  const id = n(form, "id");
  if (id) await db.delete(subscribers).where(eq(subscribers.id, id));
  redirect("/admin/messages#newsletter");
}

/* ---------- Utilisateurs ---------- */
export async function saveUserAction(form: FormData) {
  const me = await requireUser("users");
  const id = n(form, "id");
  const role = s(form, "role");
  if (!(role in ROLES)) redirect("/admin/utilisateurs?err=role");
  const password = s(form, "password", 200);
  if (id) {
    if (id === me.id && role !== "admin") redirect("/admin/utilisateurs?err=self");
    await db.update(users).set({
      role, active: id === me.id ? true : b(form, "active"),
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    }).where(eq(users.id, id));
  } else {
    const email = s(form, "email", 200).toLowerCase();
    const name = s(form, "name", 120);
    if (!email || !name || password.length < 10) redirect("/admin/utilisateurs?err=new");
    await db.insert(users).values({ email, name, role, passwordHash: hashPassword(password) }).onConflictDoNothing();
  }
  redirect("/admin/utilisateurs?ok=1");
}

export async function changeOwnPasswordAction(form: FormData) {
  const me = await requireUser();
  const current = s(form, "current", 200);
  const next = s(form, "next", 200);
  if (!verifyPassword(current, me.passwordHash) || next.length < 10) redirect("/admin/profil?err=1");
  await db.update(users).set({ passwordHash: hashPassword(next) }).where(eq(users.id, me.id));
  redirect("/admin/profil?ok=1");
}
