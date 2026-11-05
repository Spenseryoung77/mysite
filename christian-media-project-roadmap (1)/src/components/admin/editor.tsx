"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Eye, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Content, Author, Category } from "@/db/schema";
import { saveContent, type ContentPayload } from "@/lib/admin-actions";
import { slugify, TYPE_LABELS, contentUrl } from "@/lib/utils";
import { inputCls, labelCls, btnPrimary, Card } from "./ui";

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export default function Editor({ content, categories, authors, role, created }: {
  content: Content | null; categories: Category[]; authors: Author[]; role: string; created?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const canPub = role === "admin" || role === "editor";

  const [f, setF] = useState<ContentPayload>({
    title: content?.title ?? "",
    slug: content?.slug ?? "",
    type: content?.type ?? "article",
    chapo: content?.chapo ?? "",
    body: content?.body ?? "",
    categoryId: content?.categoryId ? String(content.categoryId) : "",
    authorId: content?.authorId ? String(content.authorId) : "",
    imageUrl: content?.imageUrl ?? "",
    imageAlt: content?.imageAlt ?? "",
    imageCredit: content?.imageCredit ?? "",
    verseRef: content?.verseRef ?? "",
    verseText: content?.verseText ?? "",
    verseTranslation: content?.verseTranslation ?? "Louis Segond 1910 (domaine public)",
    prayer: content?.prayer ?? "",
    series: content?.series ?? "",
    format: content?.format ?? "texte",
    mediaUrl: content?.mediaUrl ?? "",
    anonymized: content?.anonymized ?? false,
    consentNote: content?.consentNote ?? "",
    sources: content?.sources ?? "",
    seoTitle: content?.seoTitle ?? "",
    seoDescription: content?.seoDescription ?? "",
    status: content?.status ?? "draft",
    publishedAt: toLocalInput(content?.publishedAt ?? null),
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(content));
  const set = <K extends keyof ContentPayload>(k: K, v: ContentPayload[K]) => { setF((p) => ({ ...p, [k]: v })); setSaved(false); };

  const effectiveSlug = slugTouched && f.slug ? slugify(f.slug) : slugify(f.title);
  const words = useMemo(() => f.body.trim().split(/\s+/).filter(Boolean).length, [f.body]);
  const catOptions = categories.filter((c) => (f.type === "article" ? c.section === "actualites" : f.type === "enseignement" ? c.section === "foi" : true));
  const needsVerse = f.type === "meditation" || f.type === "enseignement";
  const isTemoignage = f.type === "temoignage";

  const save = () => {
    setError(null);
    startTransition(async () => {
      const r = await saveContent(content?.id ?? null, { ...f, slug: effectiveSlug });
      if (!r.ok) { setError(r.error ?? "Erreur inconnue."); return; }
      setSaved(true);
      if (!content) router.push(`/admin/contenus/${r.id}?saved=1`);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/contenus" className="mb-1 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"><ArrowLeft className="h-3 w-3" aria-hidden="true" /> Tous les contenus</Link>
          <h1 className="font-display text-2xl font-extrabold text-brand-950">{content ? "Modifier le contenu" : "Nouveau contenu"}</h1>
        </div>
        {content && (
          <Link href={`/admin/contenus/${content.id}/apercu`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">
            <Eye className="h-4 w-4" aria-hidden="true" /> Prévisualiser
          </Link>
        )}
      </div>

      {created && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-success-100 px-4 py-3 text-sm font-bold text-success-600" role="status">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Brouillon créé depuis la proposition. Relisez avec la personne et confirmez son accord avant publication.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <label htmlFor="ed-title" className={labelCls}>Titre *</label>
            <input id="ed-title" value={f.title} onChange={(e) => set("title", e.target.value)} className={`${inputCls} !text-lg !font-bold`} placeholder="Un titre clair et honnête" />
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
              <span className="font-bold">Adresse :</span>
              <code className="rounded bg-brand-50 px-2 py-1 text-brand-800">{TYPE_LABELS[f.type] ? contentUrl({ type: f.type, slug: effectiveSlug || "…" }) : ""}</code>
              <button type="button" onClick={() => setSlugTouched(true)} className="font-bold text-brand-700 hover:underline">personnaliser</button>
            </div>
            {slugTouched && (
              <input value={f.slug} onChange={(e) => set("slug", e.target.value)} className={`${inputCls} mt-2`} placeholder="adresse-personnalisee" aria-label="Adresse (slug)" />
            )}
            <label htmlFor="ed-chapo" className={`${labelCls} mt-5`}>Chapô (résumé d'accroche)</label>
            <textarea id="ed-chapo" value={f.chapo} onChange={(e) => set("chapo", e.target.value)} rows={2} className={inputCls} placeholder="Deux phrases qui donnent envie de lire, sans survendre." />
            <div className="mt-5 flex items-center justify-between">
              <label htmlFor="ed-body" className={labelCls}>Corps du texte *</label>
              <span className="text-xs text-ink-500">{words} mots · ~{Math.max(1, Math.round(words / 200))} min de lecture</span>
            </div>
            <textarea id="ed-body" value={f.body} onChange={(e) => set("body", e.target.value)} rows={16} className={`${inputCls} leading-relaxed`} placeholder={"Séparez les paragraphes par une ligne vide.\n\nLe texte est mis en page automatiquement."} />
          </Card>

          {needsVerse && (
            <Card>
              <h2 className="font-display mb-4 text-sm font-extrabold tracking-wide text-brand-950 uppercase">Texte biblique</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ed-vref" className={labelCls}>Référence</label>
                  <input id="ed-vref" value={f.verseRef} onChange={(e) => set("verseRef", e.target.value)} className={inputCls} placeholder="Psaume 119, 105" />
                </div>
                <div>
                  <label htmlFor="ed-vtrad" className={labelCls}>Traduction utilisée *</label>
                  <input id="ed-vtrad" value={f.verseTranslation} onChange={(e) => set("verseTranslation", e.target.value)} className={inputCls} />
                  <p className="mt-1 text-[11px] text-ink-500">Vérifiez les droits : Segond 1910 est dans le domaine public.</p>
                </div>
              </div>
              <label htmlFor="ed-vtext" className={`${labelCls} mt-4`}>Verset</label>
              <textarea id="ed-vtext" value={f.verseText} onChange={(e) => set("verseText", e.target.value)} rows={2} className={inputCls} />
              {f.type === "meditation" && (
                <>
                  <label htmlFor="ed-prayer" className={`${labelCls} mt-4`}>Prière (facultatif)</label>
                  <textarea id="ed-prayer" value={f.prayer} onChange={(e) => set("prayer", e.target.value)} rows={3} className={inputCls} />
                </>
              )}
            </Card>
          )}

          {isTemoignage && (
            <Card>
              <h2 className="font-display mb-4 text-sm font-extrabold tracking-wide text-brand-950 uppercase">Témoignage — accord & format</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ed-format" className={labelCls}>Format</label>
                  <select id="ed-format" value={f.format} onChange={(e) => set("format", e.target.value)} className={inputCls}>
                    <option value="texte">Texte</option><option value="video">Vidéo</option><option value="audio">Audio</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ed-media" className={labelCls}>{f.format === "video" ? "Identifiant YouTube" : "URL audio (mp3)"}</label>
                  <input id="ed-media" value={f.mediaUrl} onChange={(e) => set("mediaUrl", e.target.value)} className={inputCls} placeholder={f.format === "video" ? "nQWFzMvCfLE" : "https://…/extrait.mp3"} disabled={f.format === "texte"} />
                </div>
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm text-ink-700">
                <input type="checkbox" checked={f.anonymized} onChange={(e) => set("anonymized", e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-700" />
                Prénom modifié / anonymisation demandée par la personne
              </label>
              <label htmlFor="ed-consent" className={`${labelCls} mt-4`}>Note de consentement (affichée publiquement)</label>
              <textarea id="ed-consent" value={f.consentNote} onChange={(e) => set("consentNote", e.target.value)} rows={2} className={inputCls} placeholder="Témoignage relu et publié avec l'accord écrit de…" />
            </Card>
          )}

          {f.type === "article" && (
            <Card>
              <label htmlFor="ed-sources" className={labelCls}>Sources & méthode (affiché en bas d'article)</label>
              <textarea id="ed-sources" value={f.sources} onChange={(e) => set("sources", e.target.value)} rows={2} className={inputCls} placeholder="Communiqué de…, entretien avec…, chiffres vérifiés auprès de…" />
            </Card>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <h2 className="font-display mb-4 text-sm font-extrabold tracking-wide text-brand-950 uppercase">Publication</h2>
            <label htmlFor="ed-status" className={labelCls}>Statut</label>
            <select id="ed-status" value={f.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              <option value="draft">Brouillon</option>
              <option value="review">À relire</option>
              <option value="scheduled" disabled={!canPub}>Programmé {!canPub ? "(rôle requis)" : ""}</option>
              <option value="published" disabled={!canPub}>Publié {!canPub ? "(rôle requis)" : ""}</option>
              <option value="archived">Archivé</option>
            </select>
            <label htmlFor="ed-date" className={`${labelCls} mt-4`}>{f.status === "scheduled" ? "Paraîtra le *" : "Date de publication"}</label>
            <input id="ed-date" type="datetime-local" value={f.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className={inputCls} />
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">
              {f.status === "scheduled" ? "Le contenu apparaîtra automatiquement à cette date, puis restera dans les archives." : "Laisser vide pour dater à la publication."}
            </p>
            {error && <p className="mt-3 flex items-start gap-2 rounded-xl bg-danger-100 px-3 py-2.5 text-xs font-bold text-danger-600" role="alert"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {error}</p>}
            {saved && !error && <p className="mt-3 flex items-center gap-2 rounded-xl bg-success-100 px-3 py-2.5 text-xs font-bold text-success-600" role="status"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Enregistré.</p>}
            <button type="button" onClick={save} disabled={pending} className={`${btnPrimary} mt-4 w-full`}>
              <Save className="h-4 w-4" aria-hidden="true" /> {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
            {content && content.status === "published" && (
              <Link href={contentUrl(content)} className="mt-2 block text-center text-xs font-bold text-brand-700 hover:underline">Voir en ligne ↗</Link>
            )}
          </Card>

          <Card>
            <h2 className="font-display mb-4 text-sm font-extrabold tracking-wide text-brand-950 uppercase">Organisation</h2>
            <label htmlFor="ed-type" className={labelCls}>Type de contenu</label>
            <select id="ed-type" value={f.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
              <option value="article">Actualité</option>
              <option value="enseignement">Enseignement (Foi & Bible)</option>
              <option value="meditation">Méditation</option>
              <option value="temoignage">Témoignage</option>
            </select>
            <label htmlFor="ed-cat" className={`${labelCls} mt-4`}>Catégorie / thème</label>
            <select id="ed-cat" value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
              <option value="">— Aucune —</option>
              {catOptions.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.section === "foi" ? "Foi" : "Actu"})</option>)}
            </select>
            <label htmlFor="ed-author" className={`${labelCls} mt-4`}>Auteur *</label>
            <select id="ed-author" value={f.authorId} onChange={(e) => set("authorId", e.target.value)} className={inputCls}>
              <option value="">— Choisir —</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {f.type === "enseignement" && (
              <>
                <label htmlFor="ed-series" className={`${labelCls} mt-4`}>Dossier (série)</label>
                <input id="ed-series" value={f.series} onChange={(e) => set("series", e.target.value)} className={inputCls} placeholder="Les Psaumes pour aujourd'hui" />
              </>
            )}
          </Card>

          <Card>
            <h2 className="font-display mb-4 text-sm font-extrabold tracking-wide text-brand-950 uppercase">Image & crédit</h2>
            {f.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.imageUrl} alt="" className="mb-3 aspect-video w-full rounded-xl object-cover" />
            )}
            <label htmlFor="ed-img" className={labelCls}>URL de l'image (autorisée)</label>
            <input id="ed-img" value={f.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} className={inputCls} placeholder="https://…" />
            <label htmlFor="ed-alt" className={`${labelCls} mt-3`}>Texte alternatif *</label>
            <input id="ed-alt" value={f.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} className={inputCls} placeholder="Décrire l'image pour les lecteurs d'écran" />
            <label htmlFor="ed-credit" className={`${labelCls} mt-3`}>Crédit photo</label>
            <input id="ed-credit" value={f.imageCredit} onChange={(e) => set("imageCredit", e.target.value)} className={inputCls} placeholder="Photo : nom / plateforme" />
          </Card>

          <Card>
            <h2 className="font-display mb-4 text-sm font-extrabold tracking-wide text-brand-950 uppercase">SEO & partage</h2>
            <label htmlFor="ed-seot" className={labelCls}>Titre de page ({f.seoTitle.length}/60)</label>
            <input id="ed-seot" value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputCls} placeholder="Par défaut : le titre" />
            <label htmlFor="ed-seod" className={`${labelCls} mt-3`}>Description ({f.seoDescription.length}/160)</label>
            <textarea id="ed-seod" value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} className={inputCls} placeholder="Par défaut : le chapô" />
          </Card>
        </div>
      </div>
    </div>
  );
}