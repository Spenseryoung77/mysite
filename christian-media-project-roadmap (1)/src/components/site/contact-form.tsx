"use client";

import { useRef, useState, useTransition } from "react";
import { submitContact } from "@/lib/actions";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const mountedAt = useRef<number>(Date.now());
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const r = await submitContact({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        subject: String(fd.get("subject") ?? ""),
        body: String(fd.get("body") ?? ""),
        website: String(fd.get("website") ?? ""),
        elapsed: Date.now() - mountedAt.current,
      });
      setResult(r);
      if (r.ok) form.reset();
    });
  };

  if (result?.ok) {
    return (
      <div className="rounded-2xl bg-success-100 p-6 text-sm text-ink-700" role="status">
        <p className="flex items-start gap-2 font-bold text-success-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> Message envoyé</p>
        <p className="mt-2">{result.message}</p>
        <button type="button" onClick={() => setResult(null)} className="link-underline mt-3 font-bold text-brand-700">Écrire un autre message</button>
      </div>
    );
  }

  const input = "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-200";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-sm font-bold text-ink-700">Votre nom *</label>
          <input id="c-name" name="name" required autoComplete="name" className={input} />
        </div>
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-sm font-bold text-ink-700">Votre e-mail *</label>
          <input id="c-email" name="email" type="email" required autoComplete="email" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="c-subject" className="mb-1.5 block text-sm font-bold text-ink-700">Sujet</label>
        <select id="c-subject" name="subject" className={input} defaultValue="Question à la rédaction">
          <option>Question à la rédaction</option>
          <option>Signaler une erreur</option>
          <option>Proposer un événement</option>
          <option>Partenariat / soutien</option>
          <option>Demande sur mes données</option>
        </select>
      </div>
      <div>
        <label htmlFor="c-body" className="mb-1.5 block text-sm font-bold text-ink-700">Votre message *</label>
        <textarea id="c-body" name="body" required rows={6} className={input} placeholder="Dites-nous tout — vos coordonnées ne seront jamais publiées." />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {result && !result.ok && (
        <p className="flex items-center gap-2 text-sm font-semibold text-danger-600" role="alert"><AlertCircle className="h-4 w-4" aria-hidden="true" /> {result.message}</p>
      )}
      <button type="submit" disabled={pending} className="rounded-full bg-brand-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
        {pending ? "Envoi en cours…" : "Envoyer le message"}
      </button>
      <p className="text-xs text-ink-500">Protection anti-spam active. Vos coordonnées servent uniquement à vous répondre et ne vous inscrivent à aucune lettre.</p>
    </form>
  );
}