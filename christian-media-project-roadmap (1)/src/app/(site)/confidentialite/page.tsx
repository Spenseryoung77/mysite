import type { Metadata } from "next";
import PageHero from "@/components/site/page-hero";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero kicker="Vos données, votre confiance" title="Politique de confidentialité" />
      <div className="prose-pi no-dropcap mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p><strong>Collecte minimale.</strong> Nous ne collectons que ce qui est nécessaire : votre adresse e-mail si vous vous inscrivez à la lettre ; votre nom, e-mail et message si nous contactez ; votre récit si vous proposez un témoignage. Aucun compte lecteur n'est requis pour lire le site.</p>
        <p><strong>Finalités.</strong> La newsletter sert uniquement à envoyer la lettre hebdomadaire, après double confirmation. Les messages de contact servent uniquement à vous répondre — ils ne déclenchent jamais d'inscription. Les propositions de témoignage restent privées, avec un accès limité à la rédaction, jusqu'à validation et accord explicite de la personne.</p>
        <p><strong>Durées de conservation.</strong> Newsletter : jusqu'à désinscription, puis suppression de l'adresse. Messages de contact : le temps du traitement, puis archivage limité. Propositions de témoignage non retenues : suppression sur simple demande, et au plus tard à l'issue de l'examen éditorial.</p>
        <p><strong>Pas de traçage publicitaire.</strong> Le site n'utilise pas de cookies publicitaires ni de traceurs tiers. La mesure d'audience, si elle est activée, le sera dans une configuration respectueuse de la vie privée, sans identifiant personnel.</p>
        <p><strong>Lecteurs externes.</strong> Les lecteurs vidéo (YouTube, via youtube-nocookie.com) ne sont chargés qu'après un clic explicite : aucune connexion à ces plateformes n'a lieu avant votre demande.</p>
        <p><strong>Vos droits.</strong> Vous pouvez demander l'accès, la rectification ou la suppression de vos données à tout moment via la page Contact. Les demandes sont traitées par une personne identifiée de l'équipe. Selon votre pays de résidence, vous pouvez également saisir l'autorité de protection des données compétente.</p>
        <p><strong>Sécurité.</strong> Comptes de rédaction individuels, permissions minimales, connexions chiffrées et sauvegardes régulières. Les données sensibles (témoignages non publiés) bénéficient d'un accès restreint.</p>
        <p><strong>Évolutions.</strong> Cette politique sera adaptée à la structure juridique définitive et aux pays visés avant la mise en ligne publique ; la date de mise à jour sera alors affichée ici.</p>
      </div>
    </>
  );
}