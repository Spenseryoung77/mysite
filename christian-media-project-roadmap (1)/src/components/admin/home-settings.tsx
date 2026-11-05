"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Save, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { saveHomeSettings } from "@/lib/admin-actions";
import type { HomeSection } from "@/lib/data";
import { Card, inputCls, labelCls, btnPrimary } from "./ui";

const SECTION_LABELS: Record<string, string> = {
  articles: "Dernières actualités",
  foi: "Foi & Bible (thèmes + enseignements)",
  medias: "À regarder, à écouter",
  temoignage: "Témoignage mis en avant",
  evenements: "Prochains rendez-vous",
};

export default function HomeSettings({ articles, testimonies, featuredId, testimonyId, sections }: {
  articles: { id: number; title: string }[];
  testimonies: { id: number; title: string }[];
  featuredId: number | null;
  testimonyId: number | null;
  sections: HomeSection[];
}) {
  const [fid, setFid] = useState(featuredId ? String(featuredId) : "");
  const [tid, setTid] = useState(testimonyId ? String(testimonyId) : "");
  const [list, setList] = useState<HomeSection[]>(sections);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const move = (i: number, dir: -1 | 1) => {
    setSaved(false);
    setList((l) => {
      const next = [...l];
      const j = i + dir;
      if (j < 0 || j >= next.length) return l;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const toggle = (i: number) => {
    setSaved(false);
    setList((l) => l.map((s, k) => (k === i ? { ...s, visible: !s.visible } : s)));
  };

  const save = () => startTransition(async () => {
    await saveHomeSettings({ featuredId: fid ? Number(fid) : null, testimonyId: tid ? Number(tid) : null, sections: list });
    setSaved(true);
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display mb-4 text-sm font-extrabold tracking-wide text-brand-950 uppercase">Contenus mis en avant</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hs-une" className={labelCls}>Article à la une</label>
            <select id="hs-une" value={fid} onChange={(e) => { setFid(e.target.value); setSaved(false); }} className={inputCls}>
              <option value="">Automatique (dernier article)</option>
              {articles.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="hs-tem" className={labelCls}>Témoignage mis en avant</label>
            <select id="hs-tem" value={tid} onChange={(e) => { setTid(e.target.value); setSaved(false); }} className={inputCls}>
              <option value="">Automatique (dernier témoignage)</option>
              {testimonies.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-500">La méditation du jour est toujours la plus récente publiée (ou programmée arrivée à échéance).</p>
      </Card>

      <Card>
        <h2 className="font-display mb-1 text-sm font-extrabold tracking-wide text-brand-950 uppercase">Sections de l'accueil</h2>
        <p className="mb-4 text-xs text-ink-500">Réordonnez avec les flèches ; masquez une section sans contenu plutôt que d'afficher un bloc vide.</p>
        <ul className="space-y-2">
          {list.map((s, i) => (
            <li key={s.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 transition ${s.visible ? "bg-white ring-brand-200" : "bg-brand-50/60 ring-brand-100 opacity-70"}`}>
              <span className="font-display w-6 text-center text-sm font-extrabold text-brand-300">{i + 1}</span>
              <span className="flex-1 text-sm font-bold text-ink-900">{SECTION_LABELS[s.id] ?? s.id}</span>
              <button type="button" onClick={() => toggle(i)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${s.visible ? "bg-success-100 text-success-600" : "bg-ink-100 text-ink-500"}`} aria-pressed={s.visible}>
                {s.visible ? <Eye className="h-3.5 w-3.5" aria-hidden="true" /> : <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
                {s.visible ? "Visible" : "Masquée"}
              </button>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg bg-brand-50 p-2 text-brand-800 ring-1 ring-brand-200 transition hover:bg-brand-100 disabled:opacity-30" aria-label="Monter la section">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="rounded-lg bg-brand-50 p-2 text-brand-800 ring-1 ring-brand-200 transition hover:bg-brand-100 disabled:opacity-30" aria-label="Descendre la section">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className={btnPrimary}>
          <Save className="h-4 w-4" aria-hidden="true" /> {pending ? "Enregistrement…" : "Enregistrer l'accueil"}
        </button>
        <Link href="/" className="text-sm font-bold text-brand-700 hover:underline">Voir l'accueil ↗</Link>
        {saved && <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1.5 text-xs font-bold text-success-600" role="status"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Accueil mis à jour</span>}
      </div>
    </div>
  );
}