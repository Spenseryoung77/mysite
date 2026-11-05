import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { authors, categories, contents, shows } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { ContentFormShell, ConfirmSubmit } from "@/components/admin-client";
import { Field, Fieldset, StatusPill, toLocalInput } from "@/components/admin";
import { deleteContentAction } from "@/app/admin/actions";
import { CONTENT_TYPES, NATURES, SECTIONS, STATUSES, can, contentHref, type ContentType } from "@/lib/site";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string; ok?: string }> };

export default async function EditContent({ params, searchParams }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "nouveau";
  let c: typeof contents.$inferSelect | undefined;
  if (!isNew) {
    const num = Number(id);
    if (!Number.isInteger(num)) notFound();
    [c] = await db.select().from(contents).where(eq(contents.id, num)).limit(1);
    if (!c) notFound();
  }
  const type = (c?.type ?? sp.type) as ContentType | undefined;

  if (!type || !CONTENT_TYPES.includes(type)) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-black">Nouveau contenu</h1>
        <p className="text-slate-600">Choisissez la rubrique :</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_TYPES.map((t) => (
            <Link key={t} href={`/admin/contenus/nouveau?type=${t}`} className="card hover:border-brand">
              <p className="font-display text-lg font-black text-brand">{SECTIONS[t].singular}</p>
              <p className="text-sm text-slate-600">{SECTIONS[t].label}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const [authorList, catList, showList] = await Promise.all([
    db.select().from(authors).orderBy(asc(authors.name)),
    db.select().from(categories).where(eq(categories.section, type)).orderBy(asc(categories.sortOrder)),
    db.select().from(shows).orderBy(asc(shows.title)),
  ]);

  const canPublish = can(user.role, "publish");
  const readOnly = c && !can(user.role, "editAll") && (c.createdById !== user.id || !["brouillon", "relecture"].includes(c.status));
  const statusOptions = Object.entries(STATUSES).filter(([k]) => canPublish || ["brouillon", "relecture"].includes(k) || k === c?.status);
  const sec = SECTIONS[type];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-brand">{sec.singular}</p>
          <h1 className="font-display text-2xl font-black">{isNew ? `Nouveau : ${sec.singular.toLowerCase()}` : c!.title}</h1>
          {c && <div className="mt-1"><StatusPill status={c.status} publishedAt={c.publishedAt} /></div>}
        </div>
        {c && (
          <div className="flex gap-2">
            <Link href={`/admin/apercu/${c.id}`} target="_blank" className="btn-ghost text-sm">Prévisualiser ↗</Link>
            {c.status === "publie" && <Link href={contentHref(c)} target="_blank" className="btn-ghost text-sm">Voir en ligne ↗</Link>}
          </div>
        )}
      </div>
      {sp.ok && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-900">Contenu enregistré.</p>}
      {readOnly && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Lecture seule : ce contenu n’est plus modifiable avec votre rôle.</p>}

      <ContentFormShell>
        <input type="hidden" name="id" value={c?.id ?? ""} />
        <input type="hidden" name="type" value={type} />
        <fieldset disabled={!!readOnly} className="space-y-6">
          <Fieldset legend="Publication">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Statut" htmlFor="status" help={canPublish ? "« Publié » avec une date future = programmé." : "Soumettez « À relire » pour validation par un responsable."}>
                <select id="status" name="status" defaultValue={c?.status ?? "brouillon"} className="input w-full">
                  {statusOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Date de publication" htmlFor="publishedAt" help="Laisser vide pour publier immédiatement.">
                <input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={toLocalInput(c?.publishedAt)} className="input w-full" />
              </Field>
              <Field label="Auteur" htmlFor="authorId">
                <select id="authorId" name="authorId" defaultValue={c?.authorId ?? ""} className="input w-full">
                  <option value="">— Choisir —</option>
                  {authorList.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </Field>
              <Field label="Nature du contenu" htmlFor="nature" help="Distingue faits, enseignements et opinions.">
                <select id="nature" name="nature" defaultValue={c?.nature ?? (type === "actualite" ? "fait" : "enseignement")} className="input w-full">
                  {Object.entries(NATURES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              {catList.length > 0 && (
                <Field label="Catégorie / thème" htmlFor="categoryId">
                  <select id="categoryId" name="categoryId" defaultValue={c?.categoryId ?? ""} className="input w-full">
                    <option value="">— Aucune —</option>
                    {catList.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </Field>
              )}
              {type === "episode" && (
                <Field label="Émission" htmlFor="showId">
                  <select id="showId" name="showId" defaultValue={c?.showId ?? ""} className="input w-full">
                    <option value="">— Aucune —</option>
                    {showList.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
                  </select>
                </Field>
              )}
            </div>
          </Fieldset>

          <Fieldset legend="Contenu">
            <Field label="Titre *" htmlFor="title"><input id="title" name="title" required defaultValue={c?.title} className="input w-full" /></Field>
            <Field label="Adresse (slug)" htmlFor="slug" help={`/${sec.slug}/… — générée depuis le titre si vide.`}><input id="slug" name="slug" defaultValue={c?.slug} className="input w-full" /></Field>
            <Field label={type === "actualite" ? "Chapô" : "Résumé"} htmlFor="excerpt"><textarea id="excerpt" name="excerpt" rows={2} defaultValue={c?.excerpt ?? ""} className="input w-full" /></Field>
            <Field label="Texte" htmlFor="body" help="Paragraphes séparés par une ligne vide. ## Intertitre · > Citation · - Liste · **gras** · [lien](https://…)">
              <textarea id="body" name="body" rows={16} defaultValue={c?.body ?? ""} className="input w-full font-mono text-sm" />
            </Field>
            {(type === "foi" || type === "meditation") && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Référence biblique" htmlFor="bibleRef"><input id="bibleRef" name="bibleRef" defaultValue={c?.bibleRef ?? ""} placeholder="Jean 3.16" className="input w-full" /></Field>
                <Field label="Traduction utilisée" htmlFor="bibleTranslation" help="Vérifier les droits de reproduction."><input id="bibleTranslation" name="bibleTranslation" defaultValue={c?.bibleTranslation ?? "Louis Segond 1910 (domaine public)"} className="input w-full" /></Field>
              </div>
            )}
            {type === "meditation" && (
              <Field label="Prière (optionnelle)" htmlFor="prayer"><textarea id="prayer" name="prayer" rows={3} defaultValue={c?.prayer ?? ""} className="input w-full" /></Field>
            )}
            {type === "actualite" && (
              <>
                <Field label="Sources" htmlFor="sources" help="Une source par ligne (URL ou référence)."><textarea id="sources" name="sources" rows={3} defaultValue={c?.sources ?? ""} className="input w-full" /></Field>
              </>
            )}
            <Field label="Correction / mise à jour (affichée en tête)" htmlFor="correction"><textarea id="correction" name="correction" rows={2} defaultValue={c?.correction ?? ""} className="input w-full" /></Field>
          </Fieldset>

          {(type === "episode" || type === "temoignage") && (
            <Fieldset legend="Média">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Format" htmlFor="mediaFormat">
                  <select id="mediaFormat" name="mediaFormat" defaultValue={c?.mediaFormat ?? (type === "episode" ? "video" : "texte")} className="input w-full">
                    <option value="texte">Texte</option><option value="video">Vidéo</option><option value="audio">Audio</option>
                  </select>
                </Field>
                <div className="sm:col-span-2"><Field label="URL autorisée (YouTube, Vimeo, Spotify, fichier mp3/mp4…)" htmlFor="mediaUrl"><input id="mediaUrl" name="mediaUrl" type="url" defaultValue={c?.mediaUrl ?? ""} className="input w-full" /></Field></div>
              </div>
              <Field label="Durée" htmlFor="duration"><input id="duration" name="duration" defaultValue={c?.duration ?? ""} placeholder="12 min" className="input w-40" /></Field>
              <Field label="Transcription / sous-titres" htmlFor="transcript"><textarea id="transcript" name="transcript" rows={4} defaultValue={c?.transcript ?? ""} className="input w-full" /></Field>
            </Fieldset>
          )}
          {type !== "episode" && type !== "temoignage" && <input type="hidden" name="mediaFormat" value="texte" />}

          {type === "temoignage" && (
            <Fieldset legend="Consentement">
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="consentVerified" defaultChecked={c?.consentVerified} className="mt-1 h-4 w-4" /> L’accord explicite de la personne concernée a été recueilli et archivé (obligatoire avant validation).</label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="anonymized" defaultChecked={c?.anonymized} className="mt-1 h-4 w-4" /> Publier de façon anonymisée (auteur masqué).</label>
            </Fieldset>
          )}

          <Fieldset legend="Image">
            <Field label="URL de l’image" htmlFor="imageUrl"><input id="imageUrl" name="imageUrl" defaultValue={c?.imageUrl ?? ""} className="input w-full" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Texte alternatif" htmlFor="imageAlt"><input id="imageAlt" name="imageAlt" defaultValue={c?.imageAlt ?? ""} className="input w-full" /></Field>
              <Field label="Crédit" htmlFor="imageCredit" help="Droits vérifiés obligatoires."><input id="imageCredit" name="imageCredit" defaultValue={c?.imageCredit ?? ""} className="input w-full" /></Field>
            </div>
          </Fieldset>

          <Fieldset legend="Référencement (SEO)">
            <Field label="Titre de page" htmlFor="seoTitle"><input id="seoTitle" name="seoTitle" defaultValue={c?.seoTitle ?? ""} className="input w-full" /></Field>
            <Field label="Description" htmlFor="seoDescription"><textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={c?.seoDescription ?? ""} className="input w-full" /></Field>
          </Fieldset>
        </fieldset>
      </ContentFormShell>

      {c && canPublish && (
        <form action={deleteContentAction} className="card flex items-center justify-between gap-4 border-red-200">
          <input type="hidden" name="id" value={c.id} />
          <p className="text-sm text-slate-600">Préférez le statut « Archivé » pour retirer un contenu tout en gardant une trace.</p>
          <ConfirmSubmit message="Supprimer définitivement ce contenu ?">Supprimer</ConfirmSubmit>
        </form>
      )}
    </div>
  );
}
