import Link from "next/link";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, contents, subscribers, testimonySubmissions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { SECTIONS, can, formatDate, type ContentType } from "@/lib/site";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const now = new Date();
  const counts = await db
    .select({ status: contents.status, scheduled: sql<boolean>`${contents.publishedAt} > now()`, count: sql<number>`count(*)::int` })
    .from(contents).groupBy(contents.status, sql`${contents.publishedAt} > now()`);
  const c = (st: string, scheduled?: boolean) =>
    counts.filter((r) => r.status === st && (scheduled === undefined || !!r.scheduled === scheduled)).reduce((a, r) => a + r.count, 0);

  const toReview = await db.select().from(contents).where(eq(contents.status, "relecture")).orderBy(desc(contents.updatedAt)).limit(8);
  const scheduled = await db.select().from(contents).where(and(eq(contents.status, "publie"), gt(contents.publishedAt, now))).orderBy(contents.publishedAt).limit(8);
  const myDrafts = await db.select().from(contents).where(and(eq(contents.status, "brouillon"), eq(contents.createdById, user.id))).orderBy(desc(contents.updatedAt)).limit(8);

  const showMsgs = can(user.role, "messages");
  const [[msgs], [subs], [subsN]] = showMsgs
    ? await Promise.all([
        db.select({ n: sql<number>`count(*)::int` }).from(contactMessages).where(eq(contactMessages.handled, false)),
        db.select({ n: sql<number>`count(*)::int` }).from(testimonySubmissions).where(eq(testimonySubmissions.status, "nouveau")),
        db.select({ n: sql<number>`count(*)::int` }).from(subscribers).where(eq(subscribers.confirmed, true)),
      ])
    : [[{ n: 0 }], [{ n: 0 }], [{ n: 0 }]];

  const stats = [
    { label: "Brouillons", value: c("brouillon"), href: "/admin/contenus?statut=brouillon" },
    { label: "À relire", value: c("relecture"), href: "/admin/contenus?statut=relecture" },
    { label: "Validés", value: c("valide"), href: "/admin/contenus?statut=valide" },
    { label: "Programmés", value: c("publie", true), href: "/admin/contenus?statut=publie" },
    { label: "Publiés", value: c("publie", false), href: "/admin/contenus?statut=publie" },
  ];

  const List = ({ title, items, empty }: { title: string; items: typeof toReview; empty: string }) => (
    <section className="card">
      <h2 className="font-display text-lg font-black">{title}</h2>
      {items.length ? (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.map((i) => (
            <li key={i.id} className="py-2">
              <Link href={`/admin/contenus/${i.id}`} className="link">{i.title}</Link>
              <p className="text-xs text-slate-500">{SECTIONS[i.type as ContentType]?.singular} · {i.publishedAt ? formatDate(i.publishedAt, true) : `modifié le ${formatDate(i.updatedAt)}`}</p>
            </li>
          ))}
        </ul>
      ) : <p className="mt-3 text-sm text-slate-500">{empty}</p>}
    </section>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black">Tableau de bord</h1>
        <p className="text-slate-600">Circuit : idée → brouillon → relecture → validation → publication ou programmation → correction / archivage.</p>
      </div>
      {sp.refus && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Votre rôle ne donne pas accès à cette section.</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:border-brand">
            <p className="text-3xl font-black text-brand">{s.value}</p>
            <p className="text-sm text-slate-600">{s.label}</p>
          </Link>
        ))}
      </div>
      {showMsgs && (
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/messages" className="card hover:border-brand"><p className="text-2xl font-black">{msgs.n}</p><p className="text-sm text-slate-600">Messages non traités</p></Link>
          <Link href="/admin/messages#temoignages" className="card hover:border-brand"><p className="text-2xl font-black">{subs.n}</p><p className="text-sm text-slate-600">Propositions de témoignage nouvelles</p></Link>
          <Link href="/admin/messages#newsletter" className="card hover:border-brand"><p className="text-2xl font-black">{subsN.n}</p><p className="text-sm text-slate-600">Abonnés confirmés</p></Link>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <List title="À relire" items={toReview} empty="Rien à relire." />
        <List title="Programmés" items={scheduled} empty="Aucune publication programmée." />
        <List title="Mes brouillons" items={myDrafts} empty="Aucun brouillon." />
      </div>
    </div>
  );
}
