import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, HandHeart, CheckCircle2 } from "lucide-react";
import { getAuthors } from "@/lib/data";
import { Avatar, Kicker } from "@/components/site/ui";
import PageHero from "@/components/site/page-hero";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "À propos — notre mission et notre charte",
  description: "Paroles Inspirées est un média chrétien francophone, ouvert et interconfessionnel : mission, équipe identifiée et charte éditoriale.",
};

const CHARTE = [
  { title: "Vérifier avant de publier", body: "Chaque information est recoupée ; les articles citent leurs sources lorsque le sujet l'exige. Un doute ? Nous ne publions pas, nous vérifions." },
  { title: "Corriger ouvertement", body: "Les erreurs sont corrigées rapidement, et chaque correction est datée et signalée en bas d'article. Signalez-nous toute inexactitude." },
  { title: "Distinguer les genres", body: "Actualité, enseignement, opinion et contenu sponsorisé sont clairement étiquetés. Un enseignement exprime le point de vue de son auteur, pas une information factuelle." },
  { title: "Respecter les personnes", body: "Aucun témoignage n'est publié sans accord explicite, relu avec la personne. L'anonymisation est possible ; les mineurs font l'objet d'une vigilance renforcée." },
  { title: "Respecter les droits", body: "Images créditées et autorisées, musiques et vidéos intégrées depuis leurs plateformes officielles, citations bibliques issues de la traduction Louis Segond 1910 (domaine public)." },
  { title: "Être transparent", body: "Les partenariats et soutiens sont déclarés. Les événements relayés précisent leur organisateur. Nos lecteurs savent toujours qui parle, et pourquoi." },
];

export default async function AboutPage() {
  const authors = (await getAuthors()).filter((a) => a.slug !== "la-redaction");
  return (
    <>
      <PageHero kicker="Qui sommes-nous ?" title="Un média pour s'informer et espérer">
        Paroles Inspirées raconte la vie des communautés chrétiennes francophones, ouvre la Bible avec sérieux et donne la parole à des parcours de vie — avec rigueur journalistique et bienveillance.
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Notre mission", body: "Informer avec des faits vérifiés et des sources citées, pour inspirer confiance dans un paysage saturé de rumeurs." },
            { icon: HandHeart, title: "Notre ligne", body: "Chrétienne, ouverte et interconfessionnelle : nous accueillons les sensibilités évangéliques, protestantes, catholiques et au-delà, dans le respect de chacune." },
            { icon: Users, title: "Notre public", body: "Jeunes, familles, responsables d'Église et curieux : la francophonie, d'Abidjan à Lyon, sur téléphone comme sur ordinateur, même en connexion limitée." },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 70}>
              <div className="card-hover h-full rounded-2xl bg-white p-7 shadow-[var(--shadow-card)] ring-1 ring-brand-100">
                <v.icon className="mb-4 h-7 w-7 text-flame-600" aria-hidden="true" />
                <h2 className="font-display text-lg font-extrabold text-brand-950">{v.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <Kicker>L'équipe</Kicker>
          <h2 className="font-display mb-2 text-2xl font-extrabold text-brand-950 sm:text-3xl">Des auteurs identifiés</h2>
          <p className="mb-8 max-w-2xl text-[15px] text-ink-500">Chaque contenu est signé. Les membres qui acceptent d'être identifiés publient leur page d'auteur avec leurs publications.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {authors.map((a) => (
              <Link key={a.id} href={`/auteurs/${a.slug}`} className="card-hover group rounded-2xl bg-white p-6 text-center shadow-[var(--shadow-card)] ring-1 ring-brand-100">
                <div className="mx-auto w-fit"><Avatar author={a} size="lg" /></div>
                <p className="font-display mt-4 text-base font-extrabold text-brand-950 group-hover:text-brand-700">{a.name}</p>
                <p className="text-xs font-bold tracking-wide text-brand-600 uppercase">{a.role}</p>
                <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-ink-500">{a.bio}</p>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-16">
          <section id="charte" className="rounded-3xl bg-brand-950 p-8 text-white sm:p-12">
            <Kicker dark>Notre engagement</Kicker>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Charte éditoriale</h2>
            <p className="mt-2 max-w-2xl text-[15px] text-brand-200">Six engagements simples, vérifiables par nos lecteurs.</p>
            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CHARTE.map((c, i) => (
                <li key={c.title} className="rounded-2xl bg-brand-900/60 p-6 ring-1 ring-brand-700/60">
                  <p className="font-display text-3xl font-extrabold text-flame-400">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-display mt-2 text-base font-extrabold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-200">{c.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 flex items-start gap-2 text-sm text-brand-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-flame-400" aria-hidden="true" />
              Une question sur un article, une erreur à signaler, un partenariat à déclarer ? <Link href="/contact" className="font-bold text-flame-400 underline underline-offset-2">Écrivez-nous</Link>.
            </p>
          </section>
        </Reveal>
      </div>
    </>
  );
}