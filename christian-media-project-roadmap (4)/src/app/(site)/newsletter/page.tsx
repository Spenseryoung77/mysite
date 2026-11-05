import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { PageHero } from "@/components/content";
import { NewsletterForm } from "@/components/NewsletterForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Newsletter", robots: { index: true } };

async function handle(sp: { confirmer?: string; desinscrire?: string }) {
  if (sp.confirmer && /^[a-f0-9]{48}$/.test(sp.confirmer)) {
    const r = await db
      .update(subscribers)
      .set({ confirmed: true, confirmedAt: new Date() })
      .where(eq(subscribers.token, sp.confirmer))
      .returning({ id: subscribers.id, token: subscribers.token });
    return r[0]
      ? { ok: true, msg: "Votre inscription est confirmée. Merci et bienvenue !", token: r[0].token }
      : { ok: false, msg: "Ce lien de confirmation n’est plus valide." };
  }
  if (sp.desinscrire && /^[a-f0-9]{48}$/.test(sp.desinscrire)) {
    const r = await db.delete(subscribers).where(eq(subscribers.token, sp.desinscrire)).returning({ id: subscribers.id });
    return r[0]
      ? { ok: true, msg: "Vous êtes désinscrit(e). Votre adresse a été supprimée de notre liste." }
      : { ok: false, msg: "Cette adresse n’est pas (ou plus) inscrite." };
  }
  return null;
}

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ confirmer?: string; desinscrire?: string }> }) {
  const result = await handle(await searchParams);
  return (
    <>
      <PageHero title="Newsletter" description="Recevez les nouvelles méditations, articles et émissions de Paroles Inspirées." />
      <div className="container-pi max-w-2xl py-10">
        {result && (
          <div role="status" className={`mb-8 rounded-xl p-4 ${result.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-800"}`}>
            {result.msg}
            {"token" in result && result.token && (
              <p className="mt-2 text-sm">Vous pourrez vous désinscrire à tout moment via le lien présent dans chaque e-mail, ou <a className="link" href={`/newsletter?desinscrire=${result.token}`}>ici</a>.</p>
            )}
          </div>
        )}
        <div className="card">
          <NewsletterForm />
        </div>
        <section className="mt-8 text-sm text-slate-700">
          <h2 className="font-display text-lg font-black text-ink">Comment ça marche ?</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Vous recevez un e-mail pour confirmer votre adresse (double confirmation).</li>
            <li>Votre adresse sert uniquement à l’envoi de la newsletter ; elle n’est ni vendue ni partagée.</li>
            <li>Chaque message contient un lien de désinscription immédiate.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
