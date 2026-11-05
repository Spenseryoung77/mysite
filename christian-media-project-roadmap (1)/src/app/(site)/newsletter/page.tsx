import type { Metadata } from "next";
import { MailCheck, MousePointerClick, CalendarCheck2 } from "lucide-react";
import PageHero from "@/components/site/page-hero";
import NewsletterForm from "@/components/site/newsletter-form";

export const metadata: Metadata = {
  title: "Newsletter — la lettre du vendredi",
  description: "Recevez chaque vendredi une méditation, trois articles choisis et un chant. Double confirmation, désinscription en un clic.",
};

export default function NewsletterPage() {
  return (
    <>
      <PageHero kicker="Une lettre, pas un flux" title="La lettre du vendredi">
        Chaque vendredi matin : la méditation la plus lue de la semaine, trois articles choisis par la rédaction et un chant à écouter. C'est tout — et c'est voulu.
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-[var(--shadow-card)] ring-1 ring-brand-100 sm:p-10">
            <h2 className="font-display mb-4 text-xl font-extrabold text-brand-950">S'abonner gratuitement</h2>
            <NewsletterForm />
            <div className="mt-8 space-y-4 border-t border-brand-100 pt-6">
              {[
                { icon: MailCheck, text: "Vous recevez un e-mail de confirmation : sans clic de votre part, rien n'est envoyé." },
                { icon: CalendarCheck2, text: "Un seul envoi par semaine, le vendredi. Pas de publicité déguisée." },
                { icon: MousePointerClick, text: "Un lien de désinscription figure dans chaque message — effectif immédiatement." },
              ].map((s, i) => (
                <p key={i} className="flex items-start gap-3 text-sm text-ink-700">
                  <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" /> {s.text}
                </p>
              ))}
            </div>
          </div>
          <div className="grain relative overflow-hidden rounded-3xl bg-brand-950 p-8 text-white sm:p-10">
            <p className="text-[11px] font-bold tracking-[0.22em] text-flame-400 uppercase">Aperçu du gabarit</p>
            <div className="mt-4 overflow-hidden rounded-2xl bg-white text-ink-900 shadow-2xl">
              <div className="flex items-center gap-2 bg-brand-900 px-5 py-4">
                <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#fff" opacity="0.12"/><path d="M32 9c2.6 6.2 11 11.4 11 20.3C43 37.6 38.1 44 32 44s-11-6.4-11-14.7c0-3.6 1.3-6.7 3.3-9.8 1 2.7 2.5 4.4 4.6 5.5C28.2 20.6 29.6 14.6 32 9Z" fill="#fff"/></svg>
                <span className="font-display text-xs font-extrabold tracking-[0.12em] text-white">PAROLES INSPIRÉES · LA LETTRE</span>
              </div>
              <div className="space-y-3 px-5 py-5">
                <p className="text-[11px] font-bold tracking-widest text-brand-600 uppercase">Vendredi · Édition n° 42</p>
                <p className="font-display text-lg leading-snug font-extrabold text-brand-950">Une lampe pour aujourd'hui</p>
                <p className="text-[13px] leading-relaxed text-ink-500">« Ta parole est une lampe à mes pieds… » La méditation de Claire, trois articles à ne pas manquer et le chant de la semaine.</p>
                <div className="flex gap-2 pt-1">
                  <span className="rounded-full bg-brand-900 px-4 py-2 text-[11px] font-bold text-white">Lire la méditation</span>
                  <span className="rounded-full bg-brand-50 px-4 py-2 text-[11px] font-bold text-brand-800 ring-1 ring-brand-200">Les 3 articles</span>
                </div>
                <p className="border-t border-brand-100 pt-3 text-[10px] text-ink-300">Vous recevez cet e-mail car vous avez confirmé votre inscription. Se désinscrire en un clic.</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-brand-300">Gabarit aux couleurs du média : bleu profond, blanc, flamme dorée.</p>
          </div>
        </div>
      </div>
    </>
  );
}