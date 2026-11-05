import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Politique de confidentialité" description="Collecte minimale, finalité expliquée, accès restreint." />
      <div className="container-pi max-w-3xl space-y-8 py-10 text-slate-800">
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Modèle à adapter à la situation réelle (structure, pays, prestataires) et à faire relire par une personne qualifiée.</p>
        <section>
          <h2 className="font-display text-xl font-black">Données collectées</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Newsletter :</strong> adresse e-mail, date d’inscription et de confirmation. Finalité : envoi de la newsletter. Conservation : jusqu’à la désinscription.</li>
            <li><strong>Contact :</strong> nom, e-mail, objet et message. Finalité : répondre à votre demande. Conservation : 12 mois maximum.</li>
            <li><strong>Propositions de témoignage :</strong> nom, e-mail, récit et choix d’anonymat. Finalité : étude éditoriale. Accès limité à l’équipe éditoriale. Conservation : 12 mois si non retenu.</li>
          </ul>
        </section>
        <section><h2 className="font-display text-xl font-black">Données sensibles</h2><p className="mt-2">Un témoignage peut révéler des convictions religieuses. Il n’est traité qu’avec votre consentement explicite et n’est jamais publié sans votre accord.</p></section>
        <section><h2 className="font-display text-xl font-black">Cookies</h2><p className="mt-2">Le site public n’utilise pas de cookies publicitaires. Un cookie technique est utilisé uniquement pour la connexion de l’équipe à l’administration. Les lecteurs vidéo tiers ne sont chargés qu’après votre clic.</p></section>
        <section><h2 className="font-display text-xl font-black">Vos droits</h2><p className="mt-2">Vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à {SITE.contactEmail}.</p></section>
      </div>
    </>
  );
}
