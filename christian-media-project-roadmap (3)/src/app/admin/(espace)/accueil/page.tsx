import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { contents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getHomeSettings } from "@/lib/queries";
import { saveHomeAction } from "@/app/admin/actions";
import { Fieldset, Flash } from "@/components/admin";
import { HOME_SECTIONS, SECTIONS, type ContentType } from "@/lib/site";

export default async function HomeAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("homepage");
  const sp = await searchParams;
  const settings = await getHomeSettings();
  const published = await db
    .select({ id: contents.id, title: contents.title, type: contents.type })
    .from(contents)
    .where(and(eq(contents.status, "publie"), inArray(contents.type, ["actualite", "foi", "meditation", "episode", "temoignage"])))
    .orderBy(desc(contents.publishedAt)).limit(100);
  const testimonies = published.filter((p) => p.type === "temoignage");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-black">Page d’accueil</h1>
      <Flash ok={sp.ok} />
      <form action={saveHomeAction} className="space-y-6">
        <Fieldset legend="Mise en avant">
          <div>
            <label htmlFor="featuredId" className="label">Contenu à la une</label>
            <select id="featuredId" name="featuredId" defaultValue={settings.featuredId ?? ""} className="input w-full">
              <option value="">Automatique (dernière actualité publiée)</option>
              {published.map((p) => <option key={p.id} value={p.id}>[{SECTIONS[p.type as ContentType].singular}] {p.title}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="testimonyId" className="label">Témoignage mis en avant</label>
            <select id="testimonyId" name="testimonyId" defaultValue={settings.testimonyId ?? ""} className="input w-full">
              <option value="">Automatique (dernier publié)</option>
              {testimonies.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </Fieldset>
        <Fieldset legend="Sections affichées et ordre">
          <p className="text-sm text-slate-600">Les sections sans contenu publié sont masquées automatiquement.</p>
          <ul className="divide-y divide-slate-100">
            {settings.order.map((o, i) => (
              <li key={o.key} className="flex items-center gap-4 py-2">
                <label className="sr-only" htmlFor={`order_${o.key}`}>Position de {HOME_SECTIONS[o.key]}</label>
                <input id={`order_${o.key}`} name={`order_${o.key}`} type="number" min={1} defaultValue={i + 1} className="input w-20" />
                <label className="flex flex-1 items-center gap-3">
                  <input type="checkbox" name={`visible_${o.key}`} defaultChecked={o.visible} className="h-4 w-4" />
                  {HOME_SECTIONS[o.key]}
                </label>
              </li>
            ))}
          </ul>
        </Fieldset>
        <button className="btn-primary">Enregistrer</button>
      </form>
    </div>
  );
}
