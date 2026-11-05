"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { subscribeNewsletter } from "@/lib/actions";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";

type Result = { ok: boolean; message: string; confirmUrl?: string } | null;

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result>(null);
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await subscribeNewsletter(email);
      setResult(r);
      if (r.ok) setEmail("");
    });
  };

  if (result?.ok) {
    return (
      <div className={`rounded-xl p-4 text-sm ${compact ? "bg-brand-900/70 text-brand-100 ring-1 ring-brand-700" : "bg-success-100 text-success-600 ring-1 ring-success-600/20"}`} role="status">
        <p className="flex items-start gap-2 font-semibold"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {result.message}</p>
        {result.confirmUrl && (
          <p className={`mt-2 ${compact ? "text-brand-200" : "text-ink-700"}`}>
            Mode démonstration — l'e-mail n'est pas réellement envoyé :{" "}
            <Link href={result.confirmUrl} className="font-bold underline underline-offset-2">confirmer mon inscription ici</Link>.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className={`flex gap-2 ${compact ? "flex-col" : "flex-col sm:flex-row"}`}>
        <label className="sr-only" htmlFor={compact ? "nl-footer" : "nl-main"}>Adresse e-mail</label>
        <input
          id={compact ? "nl-footer" : "nl-main"}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.org"
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-flame-500 focus:ring-2 focus:ring-flame-500/40 ${
            compact ? "border-brand-700 bg-brand-900/70 text-white placeholder:text-brand-300" : "border-brand-200 bg-white text-ink-900 placeholder:text-ink-300"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition disabled:opacity-60 ${
            compact ? "bg-flame-500 text-brand-950 hover:bg-flame-400" : "bg-brand-900 text-white hover:bg-brand-700"
          }`}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {pending ? "Envoi…" : "Je m'abonne"}
        </button>
      </div>
      {result && !result.ok && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-danger-600" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" /> {result.message}
        </p>
      )}
      <p className={`mt-2 text-xs ${compact ? "text-brand-300" : "text-ink-500"}`}>
        Double confirmation par e-mail. Désinscription en un clic, à tout moment. Aucune donnée revendue.
      </p>
    </form>
  );
}