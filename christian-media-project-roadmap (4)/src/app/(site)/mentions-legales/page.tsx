import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Mentions légales et conditions d’utilisation" };

export default function LegalPage() {
  return (
    <>
      <PageHero title="Mentions légales & conditions d’utilisation" />
      <div className="container-pi max-w-3xl space-y-8 py-10 text-slate-800">
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Modèle à compléter et à faire valider selon la structure juridique et les pays concernés avant la mise en ligne publique.</p>
        <section><h2 className="font-display text-xl font-black">Éditeur</h2><p className="mt-2">Paroles Inspirées — [forme juridique, adresse, numéro d’enregistrement à compléter]. Directeur de la publication : [à compléter]. Contact : {SITE.contactEmail}.</p></section>
        <section><h2 className="font-display text-xl font-black">Hébergement</h2><p className="mt-2">[Nom, adresse et coordonnées de l’hébergeur à compléter].</p></section>
        <section><h2 className="font-display text-xl font-black">Propriété intellectuelle</h2><p className="mt-2">Les textes, logos et contenus originaux de Paroles Inspirées sont protégés. Toute reproduction nécessite une autorisation, à l’exception du partage de liens. Les images et médias tiers sont crédités et utilisés selon leurs licences. Citations bibliques : Louis Segond 1910 (domaine public), sauf mention contraire.</p></section>
        <section><h2 className="font-display text-xl font-black">Conditions d’utilisation</h2><p className="mt-2">Le site est accessible gratuitement. Les contenus sont proposés à titre d’information et d’édification ; ils ne remplacent pas un accompagnement pastoral, médical ou juridique. Les formulaires ne doivent pas être utilisés pour envoyer des contenus illicites ou abusifs.</p></section>
        <section><h2 className="font-display text-xl font-black">Corrections</h2><p className="mt-2">Pour signaler une erreur, utilisez la page Contact. Les corrections apportées sont indiquées sur les contenus concernés.</p></section>
      </div>
    </>
  );
}
