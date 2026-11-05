"use client";

import { useRef, useState, useTransition } from "react";
import { submitTestimony } from "@/lib/actions";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";

export default function TestimonyForm() {
  const mountedAt = useRef<number>(Date.now());
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await submitTestimony({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        body: String(fd.get("body") ?? ""),
        format: String(fd.get("format") ?? "texte"),
        anonymous: fd.get("anonymous") === "on",
        consent: fd.get("consent") === "on",
        website: String(fd.get("website") ?? ""),
        elapsed: Date.now() - mountedAt.current,
      });
      setResult(r);
      if (r.ok) (e.target as HTMLFormElement).reset();
    });
  };

  if (result?.ok) {
    return (
      <div className="rounded-2xl bg-success-100 p-6 text-sm text-ink-700" role="status">
        <p className="flex items-start gap-2 font-bold text-success-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> Proposition bien reçue</p>
        <p className="mt-2 leading-relaxed">{result.message}</p>
        <button type="button" onClick={() => setResult(null)} className="link-underline mt-3 text-sm font-bold text-brand-700">Envoyer une autre proposition</button>
      </div>
    );
  }

  const input = "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-200";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <p className="flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-[13px] text-ink-700">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
        Ce formulaire est <strong className="mx-1">privé</strong> : votre proposition est lue uniquement par la rédaction, avec un accès limité. Rien n'est publié automatiquement, et nous vérifierons votre accord avant toute publication.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="t-name" className="mb-1.5 block text-sm font-bold text-ink-700">Votre nom *</label>
          <input id="t-name" name="name" required autoComplete="name" className={input} placeholder="Restera privé" />
        </div>
        <div>
          <label htmlFor="t-email" className="mb-1.5 block text-sm font-bold text-ink-700">Votre e-mail *</label>
          <input id="t-email" name="email" type="email" required autoComplete="email" className={input} placeholder="Pour vous recontacter" />
        </div>
      </div>
      <div>
        <label htmlFor="t-format" className="mb-1.5 block text-sm font-bold text-ink-700">Format souhaité</label>
        <select id="t-format" name="format" className={input} defaultValue="texte">
          <option value="texte">Témoignage écrit</option>
          <option value="audio">Entretien audio</option>
          <option value="video">Témoignage vidéo</option>
        </select>
      </div>
      <div>
        <label htmlFor="t-body" className="mb-1.5 block text-sm font-bold text-ink-700">Votre parcours en quelques phrases *</label>
        <textarea id="t-body" name="body" required rows={6} className={input} placeholder="Racontez ce que vous souhaitez partager. Inutile d'entrer dans des détails sensibles à ce stade : nous en parlerons ensemble." />
      </div>
      <label className="flex items-start gap-3 text-sm text-ink-700">
        <input type="checkbox" name="anonymous" className="mt-0.5 h-4 w-4 rounded accent-brand-700" />
        Je souhaite que mon prénom soit modifié si le témoignage est publié.
      </label>
      <label className="flex items-start gap-3 text-sm text-ink-700">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 rounded accent-brand-700" />
        J'accepte que la rédaction conserve cette proposition pour l'étudier et me recontacter. Je pourrai demander sa suppression à tout moment. *
      </label>
      {/* Pot de miel anti-spam */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {result && !result.ok && (
        <p className="flex items-center gap-2 text-sm font-semibold text-danger-600" role="alert"><AlertCircle className="h-4 w-4" aria-hidden="true" /> {result.message}</p>
      )}
      <button type="submit" disabled={pending} className="rounded-full bg-brand-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
        {pending ? "Envoi en cours…" : "Envoyer ma proposition (privé)"}
      </button>
    </form>
  );
}