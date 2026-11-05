export function formatDate(d: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", opts ?? { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 90);
}

export function paragraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export const TYPE_LABELS: Record<string, string> = {
  article: "Actualité",
  enseignement: "Enseignement",
  meditation: "Méditation",
  temoignage: "Témoignage",
};

export const TYPE_ROUTES: Record<string, string> = {
  article: "/actualites",
  enseignement: "/foi-et-bible",
  meditation: "/meditations",
  temoignage: "/temoignages",
};

export function contentUrl(c: { type: string; slug: string }): string {
  return `${TYPE_ROUTES[c.type] ?? "/actualites"}/${c.slug}`;
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  review: "À relire",
  scheduled: "Programmé",
  published: "Publié",
  archived: "Archivé",
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}