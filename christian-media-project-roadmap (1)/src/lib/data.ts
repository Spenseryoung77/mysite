import { db } from "@/db";
import { authors, categories, contents, episodes, events, settings, shows, subscribers, messages } from "@/db/schema";
import { and, desc, eq, ilike, inArray, lte, or, sql, asc, ne } from "drizzle-orm";
import type { Content, Author, Category } from "@/db/schema";

export type ContentFull = Content & { author: Author | null; category: Category | null };

const visible = () =>
  and(inArray(contents.status, ["published", "scheduled"]), lte(contents.publishedAt, new Date()));

const withJoins = () =>
  db
    .select({ content: contents, author: authors, category: categories })
    .from(contents)
    .leftJoin(authors, eq(contents.authorId, authors.id))
    .leftJoin(categories, eq(contents.categoryId, categories.id));

type Row = { content: Content; author: Author | null; category: Category | null };
const flat = (rows: Row[]): ContentFull[] => rows.map((r) => ({ ...r.content, author: r.author, category: r.category }));

export async function getPublished(type?: string, opts?: { categorySlug?: string; limit?: number; offset?: number; excludeId?: number }) {
  const conds = [visible()];
  if (type) conds.push(eq(contents.type, type));
  if (opts?.categorySlug) conds.push(eq(categories.slug, opts.categorySlug));
  if (opts?.excludeId) conds.push(ne(contents.id, opts.excludeId));
  const where = and(...conds);
  const rows = await withJoins()
    .where(where)
    .orderBy(desc(contents.publishedAt))
    .limit(opts?.limit ?? 24)
    .offset(opts?.offset ?? 0);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contents)
    .leftJoin(categories, eq(contents.categoryId, categories.id))
    .where(where);
  return { items: flat(rows), total: count };
}

export async function getBySlug(slug: string, type?: string): Promise<ContentFull | null> {
  const conds = [eq(contents.slug, slug), visible()];
  if (type) conds.push(eq(contents.type, type));
  const rows = await withJoins().where(and(...conds)).limit(1);
  return rows.length ? flat(rows)[0] : null;
}

export async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

export async function getFeatured(): Promise<ContentFull | null> {
  const id = await getSetting("featured_id");
  if (id) {
    const rows = await withJoins().where(and(eq(contents.id, Number(id)), visible())).limit(1);
    if (rows.length) return flat(rows)[0];
  }
  const fallback = await getPublished("article", { limit: 1 });
  return fallback.items[0] ?? null;
}

export async function getFeaturedTestimony(): Promise<ContentFull | null> {
  const id = await getSetting("featured_testimony_id");
  if (id) {
    const rows = await withJoins().where(and(eq(contents.id, Number(id)), visible())).limit(1);
    if (rows.length) return flat(rows)[0];
  }
  const fallback = await getPublished("temoignage", { limit: 1 });
  return fallback.items[0] ?? null;
}

export type HomeSection = { id: string; visible: boolean };
export async function getHomeSections(): Promise<HomeSection[]> {
  const raw = await getSetting("home_sections");
  const defaults: HomeSection[] = [
    { id: "articles", visible: true },
    { id: "foi", visible: true },
    { id: "medias", visible: true },
    { id: "temoignage", visible: true },
    { id: "evenements", visible: true },
  ];
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as HomeSection[];
    return parsed.filter((p) => defaults.some((d) => d.id === p.id));
  } catch {
    return defaults;
  }
}

export async function getLatestMeditation() {
  const r = await getPublished("meditation", { limit: 1 });
  return r.items[0] ?? null;
}

export async function getCategories(section: string) {
  return db.select().from(categories).where(eq(categories.section, section)).orderBy(asc(categories.position));
}

export async function getAuthors() {
  return db.select().from(authors).orderBy(asc(authors.id));
}

export async function getAuthorBySlug(slug: string) {
  const rows = await db.select().from(authors).where(eq(authors.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getByAuthor(authorId: number, limit = 12) {
  const rows = await withJoins()
    .where(and(eq(contents.authorId, authorId), visible()))
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
  return flat(rows);
}

export async function getRelated(c: ContentFull, limit = 3) {
  const conds = [visible(), eq(contents.type, c.type), ne(contents.id, c.id)];
  if (c.categoryId) conds.push(eq(contents.categoryId, c.categoryId));
  let rows = await withJoins().where(and(...conds)).orderBy(desc(contents.publishedAt)).limit(limit);
  if (rows.length < limit) {
    rows = await withJoins()
      .where(and(visible(), eq(contents.type, c.type), ne(contents.id, c.id)))
      .orderBy(desc(contents.publishedAt))
      .limit(limit);
  }
  return flat(rows);
}

export async function getSeriesList() {
  const rows = await db
    .selectDistinct({ series: contents.series })
    .from(contents)
    .where(and(visible(), eq(contents.type, "enseignement"), sql`${contents.series} is not null`));
  return rows.map((r) => r.series).filter(Boolean) as string[];
}

export async function getShows() {
  return db.select().from(shows).orderBy(asc(shows.id));
}

export async function getShowBySlug(slug: string) {
  const rows = await db.select().from(shows).where(eq(shows.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getEpisodes(showId?: number, limit = 30) {
  const q = db
    .select({ episode: episodes, show: shows })
    .from(episodes)
    .leftJoin(shows, eq(episodes.showId, shows.id))
    .orderBy(desc(episodes.publishedAt))
    .limit(limit);
  const rows = showId ? await q.where(eq(episodes.showId, showId)) : await q;
  return rows.map((r) => ({ ...r.episode, show: r.show }));
}

export async function getEpisodeBySlug(slug: string) {
  const rows = await db
    .select({ episode: episodes, show: shows })
    .from(episodes)
    .leftJoin(shows, eq(episodes.showId, shows.id))
    .where(eq(episodes.slug, slug))
    .limit(1);
  return rows[0] ? { ...rows[0].episode, show: rows[0].show } : null;
}

export async function getEvents() {
  const rows = await db.select().from(events).orderBy(asc(events.startsAt));
  const now = new Date();
  return {
    upcoming: rows.filter((e) => e.startsAt >= now && e.status !== "cancelled"),
    cancelled: rows.filter((e) => e.startsAt >= now && e.status === "cancelled"),
    past: rows.filter((e) => e.startsAt < now).reverse(),
  };
}

export async function searchAll(q: string) {
  const term = `%${q}%`;
  const match = or(ilike(contents.title, term), ilike(contents.chapo, term), ilike(contents.body, term));
  const rows = await withJoins()
    .where(and(visible(), match))
    .orderBy(desc(contents.publishedAt))
    .limit(40);
  const eps = (await getEpisodes(undefined, 100)).filter(
    (e) => e.title.toLowerCase().includes(q.toLowerCase()) || e.summary.toLowerCase().includes(q.toLowerCase())
  );
  const evs = (await db.select().from(events)).filter(
    (e) => e.title.toLowerCase().includes(q.toLowerCase()) || e.description.toLowerCase().includes(q.toLowerCase())
  );
  return { contents: flat(rows), episodes: eps, events: evs };
}

export async function getAllPublishedForSitemap() {
  return db
    .select({ slug: contents.slug, type: contents.type, updatedAt: contents.updatedAt })
    .from(contents)
    .where(visible());
}

export async function getSubscriberStats() {
  const rows = await db.select({ status: subscribers.status, count: sql<number>`count(*)::int` }).from(subscribers).groupBy(subscribers.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.count])) as Record<string, number>;
}

export async function getNewMessageCount() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(messages).where(eq(messages.status, "new"));
  return count;
}