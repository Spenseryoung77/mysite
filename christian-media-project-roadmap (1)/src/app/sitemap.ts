import type { MetadataRoute } from "next";
import { getAllPublishedForSitemap, getShows, getEpisodes, getAuthors } from "@/lib/data";
import { contentUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const [contents, shows, eps, authors] = await Promise.all([
    getAllPublishedForSitemap(), getShows(), getEpisodes(undefined, 200), getAuthors(),
  ]);
  const statics = ["", "/actualites", "/foi-et-bible", "/meditations", "/temoignages", "/videos-podcasts", "/evenements", "/a-propos", "/contact", "/newsletter", "/soutenir", "/mentions-legales", "/confidentialite"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.7 })),
    ...contents.map((c) => ({ url: `${base}${contentUrl(c)}`, lastModified: c.updatedAt, priority: 0.8 })),
    ...shows.map((s) => ({ url: `${base}/emissions/${s.slug}`, priority: 0.6 })),
    ...eps.map((e) => ({ url: `${base}/episodes/${e.slug}`, lastModified: e.publishedAt, priority: 0.6 })),
    ...authors.map((a) => ({ url: `${base}/auteurs/${a.slug}`, priority: 0.4 })),
  ];
}