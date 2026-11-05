import { db } from "@/db";
import { authors, contents } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { authorSaveAction } from "@/lib/admin-actions";
import { AdminHead, MsgBanner, Card, inputCls, labelCls, btnPrimary, btnGhost } from "@/components/admin/ui";
import { initials } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AuthorsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireUser(["admin", "editor"]);
  const sp = await searchParams;
  const rows = await db
    .select({ a: authors, count: sql<number>`count(${contents.id})::int` })
    .from(authors)
    .leftJoin(contents, eq(contents.authorId, authors.id))
    .groupBy(authors.id)
    .orderBy(authors.id);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminHead title="Auteurs" sub="Nom, présentation, couleur d'avatar et contenus associés. Chaque auteur dispose d'une page publique." />
      <MsgBanner ok={sp.ok} err={sp.err} />

      <div className="space-y-4">
        {rows.map(({ a, count }) => (
          <Card key={a.id}>
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-display flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ backgroundColor: a.color }}>{initials(a.name)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-brand-950">{a.name}</p>
                <p className="text-xs text-ink-500">{a.role} · {count} contenu{count > 1 ? "s" : ""} · <Link href={`/auteurs/${a.slug}`} className="font-semibold text-brand-700 hover:underline">page publique ↗</Link></p>
              </div>
            </div>
            <details className="group mt-1">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100">Modifier la fiche ▾</summary>
              <form action={authorSaveAction} className="mt-4 space-y-3 rounded-xl bg-brand-50/70 p-5">
                <input type="hidden" name="id" value={a.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className={labelCls}>Nom</label><input name="name" defaultValue={a.name} className={inputCls} required /></div>
                  <div><label className={labelCls}>Rôle affiché</label><input name="role" defaultValue={a.role} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Adresse (slug)</label><input name="slug" defaultValue={a.slug} className={inputCls} /></div>
                <div><label className={labelCls}>Présentation</label><textarea name="bio" defaultValue={a.bio} rows={4} className={inputCls} /></div>
                <div className="flex items-center gap-3">
                  <label className={labelCls + " !mb-0"}>Couleur d'avatar</label>
                  <input type="color" name="color" defaultValue={a.color} className="h-9 w-14 cursor-pointer rounded-lg border border-brand-200" />
                </div>
                <button type="submit" className={btnPrimary}>Enregistrer</button>
              </form>
            </details>
          </Card>
        ))}
      </div>

      <details className="mt-6">
        <summary className={`${btnPrimary} cursor-pointer list-none`}>+ Ajouter un auteur</summary>
        <Card className="mt-4">
          <form action={authorSaveAction} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className={labelCls}>Nom *</label><input name="name" className={inputCls} required /></div>
              <div><label className={labelCls}>Rôle affiché</label><input name="role" className={inputCls} placeholder="Rédactrice / Pasteur…" /></div>
            </div>
            <div><label className={labelCls}>Présentation publique</label><textarea name="bio" rows={3} className={inputCls} placeholder="Publiée uniquement avec l'accord de la personne." /></div>
            <div className="flex items-center gap-3">
              <label className={labelCls + " !mb-0"}>Couleur</label>
              <input type="color" name="color" defaultValue="#0A4C9E" className="h-9 w-14 cursor-pointer rounded-lg border border-brand-200" />
            </div>
            <button type="submit" className={btnPrimary}>Créer l'auteur</button>
          </form>
        </Card>
      </details>
    </div>
  );
}