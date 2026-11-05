import Link from "next/link";
import { and, desc, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { authors, contents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { SECTIONS, STATUSES, CONTENT_TYPES, formatDate, type ContentType } from "@/lib/site";
import { StatusPill } from "@/components/admin";

type SP = Promise<{ type?: string; statut?: string; q?: string }>;

export default async function ContentsAdmin({ searchParams }: { searchParams: SP }) {
  await requireUser();
  const sp = await searchParams;
  const conds: SQL[] = [];
  if (sp.type && CONTENT_TYPES.includes(sp.type as ContentType)) conds.push(eq(contents.type, sp.type));
  if (sp.statut && sp.statut in STATUSES) conds.push(eq(contents.status, sp.statut));
  if (sp.q) conds.push(ilike(contents.title, `%${sp.q.replace(/[%_]/g, "")}%`));
  const rows = await db
    .select({ c: contents, authorName: authors.name })
    .from(contents).leftJoin(authors, eq(authors.id, contents.authorId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(contents.updatedAt)).limit(200);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-black">Contenus</h1>
        <Link href="/admin/contenus/nouveau" className="btn-primary">+ Nouveau contenu</Link>
      </div>
      <form className="card flex flex-wrap items-end gap-3">
        <div><label htmlFor="f-type" className="label">Rubrique</label>
          <select id="f-type" name="type" defaultValue={sp.type ?? ""} className="input">
            <option value="">Toutes</option>
            {CONTENT_TYPES.map((t) => <option key={t} value={t}>{SECTIONS[t].label}</option>)}
          </select></div>
        <div><label htmlFor="f-st" className="label">Statut</label>
          <select id="f-st" name="statut" defaultValue={sp.statut ?? ""} className="input">
            <option value="">Tous</option>
            {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div className="flex-1"><label htmlFor="f-q" className="label">Titre</label><input id="f-q" name="q" defaultValue={sp.q ?? ""} className="input w-full" /></div>
        <button className="btn-primary">Filtrer</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr><th className="p-3">Titre</th><th className="p-3">Rubrique</th><th className="p-3">Statut</th><th className="p-3">Auteur</th><th className="p-3">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ c, authorName }) => (
              <tr key={c.id}>
                <td className="p-3"><Link href={`/admin/contenus/${c.id}`} className="link">{c.title}</Link></td>
                <td className="p-3">{SECTIONS[c.type as ContentType]?.label}</td>
                <td className="p-3"><StatusPill status={c.status} publishedAt={c.publishedAt} /></td>
                <td className="p-3">{authorName ?? <span className="text-red-700">—</span>}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(c.publishedAt ?? c.updatedAt)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Aucun contenu.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
