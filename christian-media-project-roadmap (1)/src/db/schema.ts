import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

/* ---------- Auteurs ---------- */
export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Rédaction"),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url"),
  color: text("color").notNull().default("#0A4C9E"),
});

/* ---------- Catégories / thèmes ---------- */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  section: text("section").notNull(), // actualites | foi
  description: text("description").notNull().default(""),
  position: integer("position").notNull().default(0),
});

/* ---------- Contenus (articles, enseignements, méditations, témoignages) ---------- */
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // article | enseignement | meditation | temoignage
  title: text("title").notNull(),
  chapo: text("chapo").notNull().default(""),
  body: text("body").notNull().default(""),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt").notNull().default(""),
  imageCredit: text("image_credit").notNull().default(""),
  categoryId: integer("category_id"),
  authorId: integer("author_id"),
  status: text("status").notNull().default("draft"), // draft | review | scheduled | published | archived
  publishedAt: timestamp("published_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Méditations & enseignements
  verseRef: text("verse_ref"),
  verseText: text("verse_text"),
  verseTranslation: text("verse_translation"),
  prayer: text("prayer"),
  series: text("series"),
  // Témoignages
  format: text("format"), // texte | video | audio
  mediaUrl: text("media_url"), // youtube id ou url audio
  anonymized: boolean("anonymized").notNull().default(false),
  consentNote: text("consent_note"),
  // Actualité
  sources: text("sources"),
  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
});

/* ---------- Émissions & épisodes ---------- */
export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  kind: text("kind").notNull(), // video | podcast
  description: text("description").notNull().default(""),
  host: text("host").notNull().default(""),
  coverUrl: text("cover_url"),
});

export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  duration: text("duration").notNull().default(""),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  thumbnailUrl: text("thumbnail_url"),
  youtubeId: text("youtube_id"),
  audioUrl: text("audio_url"),
  transcript: text("transcript"),
  credit: text("credit").notNull().default(""),
});

/* ---------- Événements ---------- */
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  location: text("location").notNull().default(""),
  city: text("city").notNull().default(""),
  isOnline: boolean("is_online").notNull().default(false),
  organizer: text("organizer").notNull().default(""),
  isOrganizerOurs: boolean("is_organizer_ours").notNull().default(false),
  registrationEmail: text("registration_email"),
  status: text("status").notNull().default("published"), // published | cancelled
});

/* ---------- Messages (contact & propositions de témoignage) ---------- */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // contact | temoignage
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull().default(""),
  body: text("body").notNull(),
  consent: boolean("consent").notNull().default(false),
  anonymous: boolean("anonymous").notNull().default(false),
  format: text("format"),
  status: text("status").notNull().default("new"), // new | read | archived | approved
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Newsletter ---------- */
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending | confirmed | unsubscribed
  token: text("token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
});

/* ---------- Comptes de rédaction ---------- */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("redacteur"), // admin | editor | redacteur
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Réglages (accueil, etc.) ---------- */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Content = typeof contents.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Show = typeof shows.$inferSelect;
export type Episode = typeof episodes.$inferSelect;
export type EventItem = typeof events.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type User = typeof users.$inferSelect;