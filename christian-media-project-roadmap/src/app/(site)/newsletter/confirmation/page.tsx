import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FlameMark } from "@/components/site/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirmation d'inscription", robots: { index: false } };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const rows = token ? await db.select().from(subscribers).where(eq(subscribers.token, token)).limit(1) : [];
  const sub = rows[0];
  if (sub && sub.status !== "confirmed") {
    await db.update(subscribers).set({ status: "confirmed", confirmedAt: new Date() }).where(eq(subscribers.id, sub.id));
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <FlameMark className="mx-auto h-14 w-14" />
      {sub ? (
        <>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-success-100 px-4 py-2 text-sm font-bold text-success-600"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Inscription confirmée</p>
          <h1 className="font-display mt-4 text-3xl font-extrabold text-brand-950">Bienvenue dans la lettre !</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
            Votre adresse <strong className="text-ink-700">{sub.email}</strong> est confirmée. Vous recevrez la prochaine lettre du vendredi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/meditations" className="rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700">Lire la méditation du jour</Link>
            <Link href="/" className="rounded-full bg-brand-50 px-6 py-3 text-sm font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100">Retour à l'accueil</Link>
          </div>
          <p className="mt-8 text-xs text-ink-500">
            Chaque lettre contiendra un lien de désinscription. En mode démonstration :{" "}
            <Link href={`/newsletter/desinscription?token=${sub.token}`} className="link-underline font-semibold text-brand-700">se désinscrire maintenant</Link>.
          </p>
        </>
      ) : (
        <>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-danger-100 px-4 py-2 text-sm font-bold text-danger-600"><AlertCircle className="h-4 w-4" aria-hidden="true" /> Lien invalide ou expiré</p>
          <h1 className="font-display mt-4 text-3xl font-extrabold text-brand-950">Impossible de confirmer</h1>
          <p className="mt-3 text-[15px] text-ink-500">Ce lien de confirmation n'existe pas ou a déjà été remplacé. Réinscrivez-vous pour recevoir un nouveau lien.</p>
          <Link href="/newsletter" className="mt-8 inline-block rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700">Retour à l'inscription</Link>
        </>
      )}
    </div>
  );
}