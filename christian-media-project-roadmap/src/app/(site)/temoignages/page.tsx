import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getPublished } from "@/lib/data";
import { TestimonyCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/ui";
import PageHero from "@/components/site/page-hero";
import TestimonyForm from "@/components/site/testimony-form";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Témoignages",
  description: "Des parcours de foi et de vie racontés avec respect, publiés avec l'accord des personnes. Proposez votre témoignage en toute confidentialité.",
};

export default async function TemoignagesPage() {
  const { items } = await getPublished("temoignage", { limit: 24 });
  return (
    <>
      <PageHero kicker="Des vies, pas des illustrations" title="Témoignages">
        Chaque récit est recueilli, relu avec la personne concernée et publié avec son accord. Certains prénoms sont modifiés à la demande des témoins.
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {items.length === 0 ? (
          <EmptyState title="Les premiers témoignages arrivent bientôt" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t, i) => <Reveal key={t.id} delay={i * 60}><TestimonyCard c={t} /></Reveal>)}
          </div>
        )}

        <Reveal className="mt-16">
          <section id="proposer" className="grid gap-10 rounded-3xl bg-brand-50 p-8 ring-1 ring-brand-100 sm:p-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-brand-600 uppercase">
                <span className="inline-block h-px w-6 bg-brand-600" aria-hidden="true" /> Votre histoire compte
              </p>
              <h2 className="font-display text-2xl font-extrabold text-brand-950 sm:text-3xl">Proposer un témoignage</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
                Une reconstruction, une rencontre, une épreuve traversée ? Votre parcours peut aider d'autres lecteurs. Prenez le temps qu'il faut : la rédaction vous accompagne à chaque étape.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-ink-700">
                <li className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" /> Proposition strictement privée, accès limité à la rédaction.</li>
                <li className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" /> Relecture avec vous et accord écrit avant publication.</li>
                <li className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" /> Anonymisation possible, suppression sur simple demande.</li>
              </ul>
            </div>
            <TestimonyForm />
          </section>
        </Reveal>
      </div>
    </>
  );
}