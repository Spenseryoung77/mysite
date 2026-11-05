import type { Metadata } from "next";
import { Breadcrumbs, PageHero } from "@/components/content";
import { TestimonyForm } from "@/components/NewsletterForm";

export const metadata: Metadata = { title: "Proposer un témoignage" };

export default function ProposeTestimonyPage() {
  return (
    <>
      <PageHero kicker="Témoignages" title="Proposer un témoignage" description="Partagez votre parcours de foi avec la rédaction." />
      <div className="container-pi max-w-3xl py-10">
        <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: "/temoignages", label: "Témoignages" }, { label: "Proposer" }]} />
        <div className="my-6 rounded-2xl border-l-4 border-brand bg-brand-50 p-5 text-sm text-slate-800">
          <p className="font-bold">Votre proposition est privée.</p>
          <p className="mt-1">Elle n’est <strong>jamais publiée automatiquement</strong>. Seule l’équipe éditoriale y a accès. Si votre témoignage est retenu, nous vous recontacterons pour relire le texte avec vous et recueillir votre accord avant toute publication.</p>
        </div>
        <TestimonyForm />
      </div>
    </>
  );
}
