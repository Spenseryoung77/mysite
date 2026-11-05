import Link from "next/link";
import { Plus, Search, PencilLine, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { contents, authors, categories } from "@/db/schema";
import { and, desc, eq, ilike } from "drizzle-orm";
import { requireUser, canPublish } from "@/lib/auth";
import { contentStatusAction, deleteContentAction } from "@/lib/admin-actions";
import { AdminHead, MsgBanner, StatusPill, btnGhost, inputCls } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/confirm-button";
import { STATUS_LABELS, TYPE_LABELS, contentUrl, formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPES = ["article", "enseignement", "meditation", "temoignage"];

export default async function ContenusPage({ searchParams }: { searchParams: Promise<{ statut?: string; type?: string; q?: string; msg?: string; err?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const conds = [];
  if (sp.statut && STATUS_LABELS[sp.statut]) conds.push(eq(contents.status, sp.statut));
  if (sp.type && TYPES.includes(sp.type)) conds.push(eq(contents.type, sp.type));
  if (sp.q) conds.push(ilike(contents.title, `%${sp.q}%`));
  const rows = await db
    .select({ c: contents, a: authors, cat: categories })
    .from(contents)
    .leftJoin(authors, eq(contents.authorId, authors.id))
    .leftJoin(categories, eq(contents.categoryId, categories.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(contents.updatedAt))
    .limit(80);

  const link = (params: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { statut: sp.statut, type: sp.type, q: sp.q, ...params };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const qs = p.toString();
    return `/admin/contenus${qs ? `?${qs}` : ""}`;
  };
  const from = link({});
  const chip = (on: boolean) => `rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${on ? "bg-brand-900 text-white" : "bg-white text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50"}`;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHead title="Contenus" sub="Créer, relire, programmer, publier, archiver — sans toucher au code."
        action={<Link href="/admin/contenus/nouveau" className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"><Plus className="h-4 w-4" aria-hidden="true" /> Nouveau contenu</Link>} />
      <MsgBanner msg={sp.msg} err={sp.err} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href={link({ statut: undefined })} className={chip(!sp.statut)}>Tous</Link>
        {Object.entries(STATUS_LABELS).map(([k, label]) => (
          <Link key={k} href={link({ statut: k })} className={chip(sp.statut === k)}>{label}</Link>
        ))}
        <form action="/admin/contenus" method="get" className="ml-auto flex gap-2">
          {sp.statut && <input type="hidden" name="statut" value={sp.statut} />}
          {sp.type && <input type="hidden" name="type" value={sp.type} />}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-brand-400" aria-hidden="true" />
            <input name="q" type="search" defaultValue={sp.q} placeholder="Titre…" className={`${inputCls} !w-48 !rounded-full !py-2 !pl-9`} aria-label="Filtrer par titre" />
          </div>
        </form>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={link({ type: undefined })} className={chip(!sp.type)}>Tous les types</Link>
        {TYPES.map((t) => (
          <Link key={t} href={link({ type: t })} className={chip(sp.type === t)}>{TYPE_LABELS[t]}s</Link>
        ))}
        <p className="ml-auto self-center text-xs font-bold text-ink-500">{rows.length} contenu{rows.length > 1 ? "s" : ""}</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-brand-100">
        <ul className="divide-y divide-brand-100">
          {rows.length === 0 && <li className="px-6 py-12 text-center text-sm text-ink-500">Aucun contenu ne correspond à ces filtres.</li>}
          {rows.map(({ c, a, cat }) => (
            <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 transition hover:bg-brand-50/50">
              <div className="min-w-0 flex-1 basis-64">
                <Link href={`/admin/contenus/${c.id}`} className="block truncate text-[15px] font-bold text-brand-950 hover:text-brand-700">{c.title}</Link>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-500">
                  <span className="font-bold text-brand-600">{TYPE_LABELS[c.type]}</span>
                  {cat && <span>· {cat.name}</span>}
                  <span>· {a?.name ?? "—"}</span>
                  <span>· {c.status === "scheduled" && c.publishedAt ? `paraîtra le ${formatDateTime(c.publishedAt)}` : c.publishedAt ? formatDate(c.publishedAt) : `modifié le ${formatDate(c.updatedAt)}`}</span>
                </p>
              </div>
              <StatusPill status={c.status} />
              <div className="flex flex-wrap items-center gap-1.5">
                <Link href={`/admin/contenus/${c.id}`} className={btnGhost}><PencilLine className="h-3.5 w-3.5" aria-hidden="true" /> Modifier</Link>
                {(c.status === "draft" || c.status === "review") && canPublish(user) && (
                  <form action={contentStatusAction}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="published" /><input type="hidden" name="from" value={from} />
                    <button type="submit" className="rounded-lg bg-success-100 px-3 py-1.5 text-xs font-bold text-success-600 transition hover:bg-success-600 hover:text-white">Publier</button>
                  </form>
                )}
                {(c.status === "draft" || c.status === "review") && !canPublish(user) && c.status === "draft" && (
                  <form action={contentStatusAction}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="review" /><input type="hidden" name="from" value={from} />
                    <button type="submit" className="rounded-lg bg-warn-100 px-3 py-1.5 text-xs font-bold text-warn-600 transition hover:bg-warn-600 hover:text-white">Soumettre</button>
                  </form>
                )}
                {c.status === "published" && (
                  <form action={contentStatusAction}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="archived" /><input type="hidden" name="from" value={from} />
                    <button type="submit" className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-bold text-ink-700 transition hover:bg-ink-700 hover:text-white">Archiver</button>
                  </form>
                )}
                {c.status === "archived" && (
                  <form action={contentStatusAction}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="draft" /><input type="hidden" name="from" value={from} />
                    <button type="submit" className="rounded-lg bg-info-100 px-3 py-1.5 text-xs font-bold text-info-600 transition hover:bg-info-600 hover:text-white">Restaurer</button>
                  </form>
                )}
                {c.status === "published" && (
                  <Link href={contentUrl(c)} className={btnGhost} aria-label="Voir sur le site"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></Link>
                )}
                {canPublish(user) && (
                  <form action={deleteContentAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message={`Supprimer définitivement « ${c.title} » ? Préférez l'archivage si vous hésitez.`}>Suppr.</ConfirmButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}