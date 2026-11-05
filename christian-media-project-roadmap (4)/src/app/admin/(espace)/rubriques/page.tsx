import { asc } from "drizzle-orm";
import { db } from "@/db";
import { authors, categories, shows } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  deleteAuthorAction, deleteCategoryAction, deleteShowAction, saveAuthorAction, saveCategoryAction, saveShowAction,
} from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin-client";
import { Flash } from "@/components/admin";
import { CONTENT_TYPES, SECTIONS, type ContentType } from "@/lib/site";

export default async function TaxonomyAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireUser("taxonomy");
  const sp = await searchParams;
  const [cats, auths, showList] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.section), asc(categories.sortOrder)),
    db.select().from(authors).orderBy(asc(authors.name)),
    db.select().from(shows).orderBy(asc(shows.title)),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <h1 className="font-display text-3xl font-black">Rubriques, auteurs et émissions</h1>
      <Flash ok={sp.ok} err={sp.err} />

      <section className="card space-y-4">
        <h2 className="font-display text-xl font-black">Catégories et thèmes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Nom</th><th>Rubrique</th><th>Ordre</th><th></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {cats.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 font-semibold">{c.name} <span className="text-xs font-normal text-slate-500">/{c.slug}</span></td>
                  <td>{SECTIONS[c.section as ContentType]?.label}</td>
                  <td>{c.sortOrder}</td>
                  <td className="text-right">
                    <form action={deleteCategoryAction}><input type="hidden" name="id" value={c.id} /><ConfirmSubmit message="Supprimer cette catégorie ?">Supprimer</ConfirmSubmit></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={saveCategoryAction} className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div><label className="label" htmlFor="cat-name">Nom</label><input id="cat-name" name="name" required className="input w-full" /></div>
          <div><label className="label" htmlFor="cat-section">Rubrique</label>
            <select id="cat-section" name="section" className="input w-full">{CONTENT_TYPES.map((t) => <option key={t} value={t}>{SECTIONS[t].label}</option>)}</select></div>
          <div><label className="label" htmlFor="cat-order">Ordre</label><input id="cat-order" name="sortOrder" type="number" defaultValue={0} className="input w-full" /></div>
          <div className="flex items-end"><button className="btn-primary w-full">Ajouter</button></div>
        </form>
      </section>

      <section id="auteurs" className="card scroll-mt-6 space-y-4">
        <h2 className="font-display text-xl font-black">Auteurs</h2>
        {auths.map((a) => (
          <details key={a.id} className="rounded-xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-semibold">{a.name} {a.title && <span className="font-normal text-slate-500">— {a.title}</span>}</summary>
            <form action={saveAuthorAction} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={a.id} />
              <div><label className="label" htmlFor={`an-${a.id}`}>Nom</label><input id={`an-${a.id}`} name="name" defaultValue={a.name} className="input w-full" /></div>
              <div><label className="label" htmlFor={`at-${a.id}`}>Fonction</label><input id={`at-${a.id}`} name="title" defaultValue={a.title ?? ""} className="input w-full" /></div>
              <div><label className="label" htmlFor={`as-${a.id}`}>Slug</label><input id={`as-${a.id}`} name="slug" defaultValue={a.slug} className="input w-full" /></div>
              <div><label className="label" htmlFor={`ap-${a.id}`}>Photo (URL autorisée)</label><input id={`ap-${a.id}`} name="photoUrl" defaultValue={a.photoUrl ?? ""} className="input w-full" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor={`ab-${a.id}`}>Présentation</label><textarea id={`ab-${a.id}`} name="bio" rows={3} defaultValue={a.bio ?? ""} className="input w-full" /></div>
              <div><button className="btn-primary">Enregistrer</button></div>
            </form>
            <form action={deleteAuthorAction} className="mt-3"><input type="hidden" name="id" value={a.id} /><ConfirmSubmit message="Supprimer cet auteur ? Ses contenus n’auront plus d’auteur.">Supprimer l’auteur</ConfirmSubmit></form>
          </details>
        ))}
        <form action={saveAuthorAction} className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <div><label className="label" htmlFor="na-name">Nom</label><input id="na-name" name="name" required className="input w-full" /></div>
          <div><label className="label" htmlFor="na-title">Fonction</label><input id="na-title" name="title" className="input w-full" /></div>
          <div className="flex items-end"><button className="btn-primary w-full">Ajouter un auteur</button></div>
        </form>
      </section>

      <section id="emissions" className="card scroll-mt-6 space-y-4">
        <h2 className="font-display text-xl font-black">Émissions</h2>
        {showList.map((s) => (
          <details key={s.id} className="rounded-xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-semibold">{s.title} <span className="font-normal text-slate-500">— {s.format === "podcast" ? "Podcast" : "Vidéo"}</span></summary>
            <form action={saveShowAction} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={s.id} />
              <div><label className="label" htmlFor={`st-${s.id}`}>Titre</label><input id={`st-${s.id}`} name="title" defaultValue={s.title} className="input w-full" /></div>
              <div><label className="label" htmlFor={`sh-${s.id}`}>Animateur</label><input id={`sh-${s.id}`} name="host" defaultValue={s.host ?? ""} className="input w-full" /></div>
              <div><label className="label" htmlFor={`sf-${s.id}`}>Format</label>
                <select id={`sf-${s.id}`} name="format" defaultValue={s.format} className="input w-full"><option value="video">Vidéo</option><option value="podcast">Podcast</option></select></div>
              <div><label className="label" htmlFor={`ss-${s.id}`}>Slug</label><input id={`ss-${s.id}`} name="slug" defaultValue={s.slug} className="input w-full" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor={`sd-${s.id}`}>Présentation</label><textarea id={`sd-${s.id}`} name="description" rows={3} defaultValue={s.description ?? ""} className="input w-full" /></div>
              <div><button className="btn-primary">Enregistrer</button></div>
            </form>
            <form action={deleteShowAction} className="mt-3"><input type="hidden" name="id" value={s.id} /><ConfirmSubmit message="Supprimer cette émission ?">Supprimer l’émission</ConfirmSubmit></form>
          </details>
        ))}
        <form action={saveShowAction} className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div><label className="label" htmlFor="ns-title">Titre</label><input id="ns-title" name="title" required className="input w-full" /></div>
          <div><label className="label" htmlFor="ns-host">Animateur</label><input id="ns-host" name="host" className="input w-full" /></div>
          <div><label className="label" htmlFor="ns-format">Format</label><select id="ns-format" name="format" className="input w-full"><option value="video">Vidéo</option><option value="podcast">Podcast</option></select></div>
          <div className="flex items-end"><button className="btn-primary w-full">Ajouter</button></div>
        </form>
      </section>
    </div>
  );
}
