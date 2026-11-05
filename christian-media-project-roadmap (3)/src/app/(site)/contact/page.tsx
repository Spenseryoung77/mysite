import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { ContactForm } from "@/components/NewsletterForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Contacter l’équipe de Paroles Inspirées." };

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact" description="Une question, une suggestion, une erreur à signaler ? Écrivez-nous." />
      <div className="container-pi grid gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2"><ContactForm /></div>
        <aside className="card h-fit text-sm text-slate-700">
          <h2 className="font-display text-lg font-black text-ink">Coordonnées</h2>
          <p className="mt-2">E-mail : <a className="link" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></p>
          <p className="mt-4">Les messages sont lus par l’équipe éditoriale et conservés au maximum 12 mois. Vos coordonnées ne sont jamais publiées.</p>
        </aside>
      </div>
    </>
  );
}
