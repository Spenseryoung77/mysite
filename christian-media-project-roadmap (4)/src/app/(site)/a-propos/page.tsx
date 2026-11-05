import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/db";
import { authors } from "@/db/schema";
import { PageHero } from "@/components/content";
import { ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "À propos", description: "Mission, vision, équipe et charte éditoriale de Paroles Inspirées." };

export default async function AboutPage() {
  await ensureSeed();
  const team = await db.select().from(authors);
  return (
    <>
      <PageHero kicker="Le média" title="À propos de Paroles Inspirées" description="Un média chrétien francophone pour s’informer, nourrir sa foi et partager l’espérance." />
      <div className="container-pi grid gap-12 py-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="font-display text-2xl font-black">Notre mission</h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-700">
              Offrir aux lecteurs francophones des contenus fiables et inspirants : actualités des initiatives chrétiennes,
              enseignements pour découvrir la Bible, méditations régulières, témoignages et émissions audiovisuelles,
              accessibles sur téléphone comme sur ordinateur, même avec une connexion limitée.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-black">Notre vision</h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-700">
              Être un lieu de confiance où chacun — jeunes, familles, responsables d’Église ou simples curieux —
              trouve une parole juste, bienveillante et enracinée dans l’Évangile.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-black">Notre ligne chrétienne</h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-700">
              Paroles Inspirées se reconnaît dans la foi chrétienne exprimée par la Bible et les grandes confessions de foi historiques.
              La ligne confessionnelle détaillée sera précisée par l’équipe fondatrice.
            </p>
          </section>
          <section id="charte" className="scroll-mt-24 rounded-3xl bg-brand-50 p-8">
            <h2 className="font-display text-2xl font-black">Charte éditoriale</h2>
            <ul className="mt-4 space-y-4 text-slate-800">
              <li><strong>Vérification.</strong> Les informations publiées sont vérifiées ; les sources sont indiquées lorsque le sujet l’exige.</li>
              <li><strong>Auteurs identifiés.</strong> Chaque contenu est signé par un auteur ou par « La rédaction ».</li>
              <li><strong>Distinction des genres.</strong> Informations, enseignements, opinions et contenus sponsorisés sont clairement signalés.</li>
              <li><strong>Correction des erreurs.</strong> Toute erreur signalée est examinée ; les corrections sont indiquées en tête d’article avec la date de mise à jour.</li>
              <li><strong>Témoignages.</strong> Aucun témoignage n’est publié sans relecture et accord explicite de la personne concernée ; l’anonymat est possible. Vigilance renforcée pour les mineurs.</li>
              <li><strong>Droits.</strong> Les images, vidéos, musiques et traductions bibliques sont utilisées dans le respect de leurs droits ; les crédits sont affichés.</li>
              <li><strong>Partenariats.</strong> Tout partenariat ou financement lié à un contenu est mentionné de manière transparente.</li>
            </ul>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="card">
            <h2 className="font-display text-lg font-black">L’équipe</h2>
            <ul className="mt-3 space-y-3">
              {team.map((a) => (
                <li key={a.id}>
                  <Link href={`/auteurs/${a.slug}`} className="link">{a.name}</Link>
                  {a.title && <p className="text-sm text-slate-600">{a.title}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">Seuls les membres ayant accepté d’être identifiés apparaissent ici.</p>
          </section>
          <section className="card">
            <h2 className="font-display text-lg font-black">Nous écrire</h2>
            <p className="mt-2 text-sm text-slate-700">Une question, une erreur à signaler, une proposition ?</p>
            <Link href="/contact" className="btn-primary mt-4">Contacter l’équipe</Link>
          </section>
        </aside>
      </div>
    </>
  );
}
