import type { Metadata } from "next";
import PageHero from "@/components/site/page-hero";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <>
      <PageHero kicker="Informations officielles" title="Mentions légales" />
      <div className="prose-pi no-dropcap mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p><strong>Éditeur du site.</strong> Paroles Inspirées — média chrétien francophone. Cette version est une démonstration : la structure éditrice définitive (association, nom légal, adresse, numéro d'enregistrement selon le pays) sera renseignée ici avant la mise en ligne publique, conformément aux obligations locales applicables.</p>
        <p><strong>Directrice de la publication.</strong> Grâce Mbaye, rédactrice en chef. Contact : via la page Contact du site.</p>
        <p><strong>Hébergement.</strong> Les informations de l'hébergeur (raison sociale, adresse, coordonnées) seront publiées ici lors du choix définitif de l'hébergement de production.</p>
        <p><strong>Propriété intellectuelle.</strong> Les textes éditoriaux de Paroles Inspirées sont protégés ; les courtes citations sont admises avec mention de la source et un lien vers l'article d'origine. Les photographies d'illustration proviennent de la banque Pexels et sont créditées sous chaque image. Les vidéos sont intégrées depuis les chaînes officielles de leurs ayants droit, sans réhébergement.</p>
        <p><strong>Textes bibliques.</strong> Sauf mention contraire, les citations bibliques sont issues de la traduction Louis Segond 1910, tombée dans le domaine public. Toute utilisation d'une autre traduction fera l'objet d'une vérification des conditions de reproduction et d'une mention explicite.</p>
        <p><strong>Responsabilité.</strong> La rédaction vérifie ses informations et corrige ses erreurs ; les liens externes n'engagent que leurs auteurs. Les événements relayés sont organisés par des tiers, clairement identifiés sur chaque fiche.</p>
        <p><strong>Signalement.</strong> Pour toute demande de rectification ou de retrait (texte, image, témoignage), écrivez via la page Contact : les demandes fondées sont traitées rapidement.</p>
      </div>
    </>
  );
}