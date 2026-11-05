import Link from "next/link";
import { Headphones, Play, Plus, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getShows, getEpisodes } from "@/lib/data";
import { episodeSaveAction, episodeDeleteAction } from "@/lib/admin-actions";
import { AdminHead, MsgBanner, Card, inputCls, labelCls, btnPrimary, btnGhost } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/confirm-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ShowsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; msg?: string }> }) {
  await requireUser(["admin", "editor"]);
  const sp = await searchParams;
  const [shows, allEps] = await Promise.all([getShows(), getEpisodes(undefined, 100)]);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminHead title="Émissions & épisodes" sub="Chaque épisode : vignette, résumé, durée, URL autorisée, crédits et transcription quand elle existe." />
      <MsgBanner ok={sp.ok} err={sp.err} msg={sp.msg} />

      <div className="space-y-8">
        {shows.map((s) => {
          const eps = allEps.filter((e) => e.showId === s.id);
          const isVideo = s.kind === "video";
          return (
            <Card key={s.id}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-flame-400">
                  {isVideo ? <Play className="h-5 w-5" fill="currentColor" aria-hidden="true" /> : <Headphones className="h-5 w-5" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-extrabold text-brand-950">{s.title}</h2>
                  <p className="text-xs text-ink-500">{isVideo ? "Émission vidéo" : "Podcast"} · {s.host} · {eps.length} épisode{eps.length > 1 ? "s" : ""} · <Link href={`/emissions/${s.slug}`} className="font-semibold text-brand-700 hover:underline">page publique ↗</Link></p>
                </div>
              </div>

              <ul className="divide-y divide-brand-100">
                {eps.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/episodes/${e.slug}`} className="block truncate text-sm font-bold text-brand-950 hover:text-brand-700">{e.title}</Link>
                      <p className="text-xs text-ink-500">{e.duration} · {formatDate(e.publishedAt)} · {e.youtubeId ? `YouTube : ${e.youtubeId}` : e.audioUrl ? "audio lié" : "média manquant"}</p>
                    </div>
                    <form action={episodeDeleteAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <ConfirmButton message={`Supprimer l'épisode « ${e.title} » ?`}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Suppr.</ConfirmButton>
                    </form>
                  </li>
                ))}
                {eps.length === 0 && <li className="py-4 text-sm text-ink-500">Aucun épisode — ajoutez le premier ci-dessous.</li>}
              </ul>

              <details className="mt-3">
                <summary className={`${btnGhost} cursor-pointer list-none`}><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Ajouter un épisode</summary>
                <form action={episodeSaveAction} className="mt-4 space-y-3 rounded-xl bg-brand-50/70 p-5">
                  <input type="hidden" name="showId" value={s.id} />
                  <div><label className={labelCls}>Titre *</label><input name="title" className={inputCls} required /></div>
                  <div><label className={labelCls}>Résumé</label><textarea name="summary" rows={2} className={inputCls} /></div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div><label className={labelCls}>Durée</label><input name="duration" className={inputCls} placeholder="10 min" /></div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>{isVideo ? "Identifiant YouTube (chaîne autorisée)" : "URL audio (mp3 autorisé)"}</label>
                      <input name={isVideo ? "youtubeId" : "audioUrl"} className={inputCls} placeholder={isVideo ? "nQWFzMvCfLE" : "https://…"} />
                    </div>
                  </div>
                  <div><label className={labelCls}>URL de vignette</label><input name="thumbnailUrl" className={inputCls} placeholder="https://…" /></div>
                  <div><label className={labelCls}>Transcription / déroulé</label><textarea name="transcript" rows={2} className={inputCls} /></div>
                  <div><label className={labelCls}>Crédits</label><input name="credit" className={inputCls} placeholder="Vidéo : chaîne officielle… / Extrait de démonstration…" /></div>
                  <button type="submit" className={btnPrimary}>Publier l'épisode</button>
                </form>
              </details>
            </Card>
          );
        })}
      </div>
    </div>
  );
}