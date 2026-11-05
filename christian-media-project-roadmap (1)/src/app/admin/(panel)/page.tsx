import Link from "next/link";
import { FileText, Eye, PenLine, CalendarClock, Inbox, Mail, ArrowRight, Lightbulb } from "lucide-react";
import { db } from "@/db";
import { contents, messages, authors } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getSubscriberStats } from "@/lib/data";
import { AdminHead, Card, StatusPill } from "@/components/admin/ui";
import { STATUS_LABELS, TYPE_LABELS, contentUrl, formatDateTime, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [statusRows, recentMessages, scheduledRows, subs, recentPublished] = await Promise.all([
    db.select({ status: contents.status, count: sql<number>`count(*)::int` }).from(contents).groupBy(contents.status),
    db.select().from(messages).orderBy(desc(messages.createdAt)).limit(4),
    db.select({ c: contents, a: authors }).from(contents).leftJoin(authors, eq(contents.authorId, authors.id))
      .where(eq(contents.status, "scheduled")).orderBy(contents.publishedAt).limit(5),
    getSubscriberStats(),
    db.select({ c: contents }).from(contents).where(eq(contents.status, "published")).orderBy(desc(contents.publishedAt)).limit(5),
  ]);
  const counts = Object.fromEntries(statusRows.map((r) => [r.status, r.count]));
  const stats = [
    { label: "Publiés", key: "published", icon: Eye, cls: "text-success-600 bg-success-100" },
    { label: "Brouillons", key: "draft", icon: PenLine, cls: "text-ink-700 bg-ink-100" },
    { label: "À relire", key: "review", icon: FileText, cls: "text-warn-600 bg-warn-100" },
    { label: "Programmés", key: "scheduled", icon: CalendarClock, cls: "text-info-600 bg-info-100" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHead
        title={`Bonjour, ${user.name.split(" ")[0]} 👋`}
        sub="Voici l'état de la rédaction — idée → brouillon → relecture → validation → publication."
        action={<Link href="/admin/contenus/nouveau" className="rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">+ Nouveau contenu</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.key} href={`/admin/contenus?statut=${s.key}`} className="card-hover rounded-2xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-brand-100">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.cls}`}><s.icon className="h-5 w-5" aria-hidden="true" /></span>
            <p className="font-display mt-3 text-3xl font-extrabold text-brand-950">{counts[s.key] ?? 0}</p>
            <p className="text-sm font-bold text-ink-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display flex items-center gap-2 text-base font-extrabold text-brand-950"><CalendarClock className="h-4 w-4 text-info-600" aria-hidden="true" /> Publications programmées</h2>
            <Link href="/admin/contenus?statut=scheduled" className="text-xs font-bold text-brand-700 hover:underline">Tout voir</Link>
          </div>
          {scheduledRows.length === 0 ? (
            <p className="rounded-xl bg-brand-50 px-4 py-6 text-center text-sm text-ink-500">Rien de programmé. Préparez les méditations à l'avance !</p>
          ) : (
            <ul className="space-y-3">
              {scheduledRows.map(({ c }) => (
                <li key={c.id} className="flex items-center gap-3 rounded-xl bg-brand-50/70 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/contenus/${c.id}`} className="block truncate text-sm font-bold text-brand-950 hover:text-brand-700">{c.title}</Link>
                    <p className="text-xs text-ink-500">{TYPE_LABELS[c.type]} · paraîtra le <strong className="text-info-600">{c.publishedAt ? formatDateTime(c.publishedAt) : "—"}</strong></p>
                  </div>
                  <StatusPill status="scheduled" />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex items-start gap-2 text-xs text-ink-500">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-flame-600" aria-hidden="true" />
            Un contenu programmé devient visible automatiquement à sa date, sans action manuelle, et reste ensuite dans les archives.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display flex items-center gap-2 text-base font-extrabold text-brand-950"><Inbox className="h-4 w-4 text-brand-600" aria-hidden="true" /> Derniers messages</h2>
            <Link href="/admin/messages" className="text-xs font-bold text-brand-700 hover:underline">Boîte complète</Link>
          </div>
          <ul className="space-y-3">
            {recentMessages.map((m) => (
              <li key={m.id} className="flex items-start gap-3 rounded-xl bg-brand-50/70 px-4 py-3">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${m.status === "new" ? "bg-flame-500" : "bg-brand-200"}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-brand-950">{m.kind === "temoignage" ? "🕊 Proposition de témoignage" : m.subject}</p>
                  <p className="truncate text-xs text-ink-500">{m.name} · {formatDate(m.createdAt)}</p>
                </div>
                <Link href="/admin/messages" className="text-brand-400 hover:text-brand-700" aria-label="Ouvrir les messages"><ArrowRight className="h-4 w-4" /></Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-900 px-4 py-3 text-white">
            <p className="flex items-center gap-2 text-sm font-bold"><Mail className="h-4 w-4 text-flame-400" aria-hidden="true" /> Newsletter</p>
            <p className="text-sm"><strong className="font-display text-lg">{subs.confirmed ?? 0}</strong> confirmés · {subs.pending ?? 0} en attente</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-display mb-4 text-base font-extrabold text-brand-950">Dernières mises en ligne</h2>
        <ul className="divide-y divide-brand-100">
          {recentPublished.map(({ c }) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
              <StatusPill status={c.status} />
              <Link href={`/admin/contenus/${c.id}`} className="min-w-0 flex-1 truncate text-sm font-bold text-brand-950 hover:text-brand-700">{c.title}</Link>
              <span className="text-xs text-ink-500">{TYPE_LABELS[c.type]} · {formatDate(c.publishedAt)}</span>
              <Link href={contentUrl(c)} className="text-xs font-bold text-brand-700 hover:underline">Voir ↗</Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-500">Circuit de publication : {Object.values(STATUS_LABELS).filter((s) => s !== "Archivé").join(" → ")} — puis correction et archivage si nécessaire.</p>
      </Card>
    </div>
  );
}