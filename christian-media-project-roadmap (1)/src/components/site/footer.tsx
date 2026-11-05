import Link from "next/link";
import { Logo } from "./ui";
import NewsletterForm from "./newsletter-form";

const RUBRIQUES = [
  { href: "/actualites", label: "Actualités" },
  { href: "/foi-et-bible", label: "Foi & Bible" },
  { href: "/meditations", label: "Méditations" },
  { href: "/temoignages", label: "Témoignages" },
  { href: "/videos-podcasts", label: "Vidéos & podcasts" },
  { href: "/evenements", label: "Événements" },
];

const MEDIA = [
  { href: "/a-propos", label: "Notre mission" },
  { href: "/a-propos#charte", label: "Charte éditoriale" },
  { href: "/contact", label: "Nous contacter" },
  { href: "/soutenir", label: "Soutenir le projet" },
  { href: "/admin", label: "Espace rédaction" },
];

export default function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-brand-950 text-brand-200">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-brand-700/30 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1.2fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Un média chrétien francophone pour s'informer, nourrir sa foi et découvrir des témoignages qui donnent espérance — sur téléphone comme sur ordinateur.
            </p>
            <p className="mt-4 text-xs text-brand-300">
              « Que la parole du Christ habite en vous dans toute sa richesse. » — Colossiens 3.16
            </p>
          </div>
          <nav aria-label="Rubriques">
            <h3 className="font-display mb-3 text-sm font-extrabold tracking-widest text-white uppercase">Rubriques</h3>
            <ul className="space-y-2 text-sm">
              {RUBRIQUES.map((l) => (
                <li key={l.href}><Link href={l.href} className="link-underline hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Le média">
            <h3 className="font-display mb-3 text-sm font-extrabold tracking-widest text-white uppercase">Le média</h3>
            <ul className="space-y-2 text-sm">
              {MEDIA.map((l) => (
                <li key={l.href}><Link href={l.href} className="link-underline hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="font-display mb-3 text-sm font-extrabold tracking-widest text-white uppercase">La lettre hebdo</h3>
            <p className="mb-3 text-sm">Chaque vendredi : la méditation la plus lue, trois articles choisis et un chant. Sans bruit.</p>
            <NewsletterForm compact />
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-brand-800 pt-6 text-xs text-brand-300 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Paroles Inspirées — Tous droits réservés.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
            <Link href="/newsletter" className="hover:text-white">Newsletter</Link>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-brand-400/70">
          Version de démonstration : les contenus publiés ici sont des exemples éditoriaux destinés à valider la maquette et les fonctionnalités.
        </p>
      </div>
    </footer>
  );
}