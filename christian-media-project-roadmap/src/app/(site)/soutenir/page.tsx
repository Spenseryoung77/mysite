import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, Hammer, Server, Accessibility, ShieldCheck } from "lucide-react";
import PageHero from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Soutenir le média",
  description: "Pourquoi et comment soutenir Paroles Inspirées. Aucun paiement n'est activé tant que le cadre juridique et le prestataire ne sont pas validés.",
};

export default function SoutenirPage() {
  return (
    <>
      <PageHero kicker="Après validation — en préparation" title="Soutenir Paroles Inspirées">
        Un média indépendant a besoin de lecteurs — et, un jour, de donateurs. Voici, en toute transparence, ce que nous prévoyons et ce qui n'est pas encore ouvert.
      </PageHero>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl bg-warn-100 p-6 text-sm text-ink-700 ring-1 ring-warn-600/20">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-warn-600" aria-hidden="true" />
          <p>
            <strong className="text-warn-600">Aucun paiement n'est actif à ce jour.</strong> Le bouton « Soutenir » n'apparaîtra dans l'en-tête qu'une fois la structure juridique, le prestataire de paiement et le parcours complet testés et validés. Le site ne stockera jamais de numéros de carte.
          </p>
        </div>

        <h2 className="font-display mt-12 mb-6 text-2xl font-extrabold text-brand-950">À quoi serviraient les contributions ?</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: Hammer, title: "Le reportage", body: "Déplacements, temps d'enquête et vérification : l'information de terrain a un coût, la rumeur est gratuite." },
            { icon: Server, title: "L'infrastructure", body: "Hébergement sobre, sauvegardes testées, sécurité des comptes et des données de nos lecteurs." },
            { icon: Accessibility, title: "L'accessibilité", body: "Transcriptions audio, sous-titrage, site léger pour les connexions limitées : l'espérance est pour tout le monde." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-brand-100">
              <c.icon className="mb-3 h-6 w-6 text-flame-600" aria-hidden="true" />
              <h3 className="font-display text-base font-extrabold text-brand-950">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-brand-50 p-8 ring-1 ring-brand-100">
          <HandHeart className="mb-3 h-7 w-7 text-brand-700" aria-hidden="true" />
          <h2 className="font-display text-xl font-extrabold text-brand-950">En attendant, trois gestes gratuits qui aident vraiment</h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-[15px] text-ink-700">
            <li>Abonnez-vous à <Link href="/newsletter" className="link-underline font-bold text-brand-700">la lettre du vendredi</Link> et lisez-la.</li>
            <li>Partagez un article qui vous a nourri, avec son lien d'origine.</li>
            <li>Signalez-nous une erreur ou proposez un sujet via la <Link href="/contact" className="link-underline font-bold text-brand-700">page contact</Link>.</li>
          </ol>
        </div>
      </div>
    </>
  );
}