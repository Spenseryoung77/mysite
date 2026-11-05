import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, ShieldCheck, MessageSquareHeart } from "lucide-react";
import PageHero from "@/components/site/page-hero";
import ContactForm from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrivez à la rédaction de Paroles Inspirées : questions, corrections, événements, partenariats. Réponse sous quelques jours ouvrés.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero kicker="Parlons-nous" title="Contacter la rédaction">
        Une question, une correction à signaler, un événement à proposer ? Chaque message est lu par une personne de l'équipe — pas par un robot.
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-white p-7 shadow-[var(--shadow-card)] ring-1 ring-brand-100 sm:p-9">
            <ContactForm />
          </div>
          <aside className="space-y-5">
            <div className="rounded-2xl bg-brand-50 p-6 ring-1 ring-brand-100">
              <Mail className="mb-3 h-6 w-6 text-brand-600" aria-hidden="true" />
              <h2 className="font-display text-base font-extrabold text-brand-950">Adresse officielle</h2>
              <p className="mt-1 text-sm text-ink-500">contact@paroles-inspirees.org<br />Boîte relevée chaque jour ouvré.</p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-6 ring-1 ring-brand-100">
              <Clock className="mb-3 h-6 w-6 text-brand-600" aria-hidden="true" />
              <h2 className="font-display text-base font-extrabold text-brand-950">Délai de réponse</h2>
              <p className="mt-1 text-sm text-ink-500">Sous quelques jours ouvrés. Les signalements d'erreurs sont traités en priorité.</p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-6 ring-1 ring-brand-100">
              <MessageSquareHeart className="mb-3 h-6 w-6 text-brand-600" aria-hidden="true" />
              <h2 className="font-display text-base font-extrabold text-brand-950">Un témoignage à proposer ?</h2>
              <p className="mt-1 text-sm text-ink-500">Utilisez plutôt le <Link href="/temoignages#proposer" className="link-underline font-bold text-brand-700">formulaire privé dédié</Link>, conçu pour protéger votre récit.</p>
            </div>
            <p className="flex items-start gap-2 px-2 text-xs text-ink-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
              Vos coordonnées ne sont jamais publiées ni transmises. Un message de contact ne vaut jamais inscription à la newsletter.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}