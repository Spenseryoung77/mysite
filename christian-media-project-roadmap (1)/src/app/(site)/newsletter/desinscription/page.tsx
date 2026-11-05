import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, AlertCircle } from "lucide-react";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FlameMark } from "@/components/site/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Désinscription", robots: { index: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const rows = token ? await db.select().from(subscribers).where(eq(subscribers.token, token)).limit(1) : [];
  const sub = rows[0];
  if (sub && sub.status !== "unsubscribed") {
    await db.update(subscribers).set({ status: "unsubscribed" }).where(eq(subscribers.id, sub.id));
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <FlameMark className="mx-auto h-14 w-14" />
      {sub ? (
        <>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-info-100 px-4 py-2 text-sm font-bold text-info-600"><HeartHandshake className="h-4 w-4" aria-hidden="true" /> Désinscription effective</p>
          <h1 className="font-display mt-4 text-3xl font-extrabold text-brand-950">C'est noté, à bientôt peut-être</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
            L'adresse <strong className="text-ink-700">{sub.email}</strong> ne recevra plus la lettre. Vous pouvez vous réinscrire à tout moment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/newsletter" className="rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700">Se réinscrire</Link>
            <Link href="/" className="rounded-full bg-brand-50 px-6 py-3 text-sm font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100">Retour à l'accueil</Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-danger-100 px-4 py-2 text-sm font-bold text-danger-600"><AlertCircle className="h-4 w-4" aria-hidden="true" /> Lien invalide</p>
          <h1 className="font-display mt-4 text-3xl font-extrabold text-brand-950">Lien de désinscription introuvable</h1>
          <p className="mt-3 text-[15px] text-ink-500">Si vous recevez encore la lettre, écrivez-nous via la page contact : nous supprimons votre adresse manuellement.</p>
          <Link href="/contact" className="mt-8 inline-block rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700">Contacter la rédaction</Link>
        </>
      )}
    </div>
  );
}