import type { Metadata } from "next";
import Link from "next/link";
import { Archive } from "lucide-react";
import { getPublished, getLatestMeditation } from "@/lib/data";
import { MeditationPanel } from "@/components/site/cards";
import { EmptyState } from "@/components/site/ui";
import { contentUrl, formatDate } from "@/lib/utils";
import PageHero from "@/components/site/page-hero";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Méditations",
  description: "Un rendez-vous spirituel court : un texte biblique, une réflexion, une prière. Archives complètes des méditations de Paroles Inspirées.",
};

export default async function MeditationsPage() {
  const [latest, all] = await Promise.all([getLatestMeditation(), getPublished("meditation", { limit: 60 })]);
  const archive = all.items.filter((m) => m.id !== latest?.id);
  const groups = new Map<string, typeof archive>();
  for (const m of archive) {
    const key = formatDate(m.publishedAt, { month: "long", year: "numeric" });
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }

  return (
    <>
      <PageHero kicker="Le rendez-vous du matin" title="Méditations">
        Quelques minutes, un texte biblique, une réflexion et une prière — écrites chaque matin par Claire Fontaine. Les méditations programmées paraissent automatiquement à 6 h.
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {latest ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <Reveal><MeditationPanel c={latest} label="Dernière méditation" /></Reveal>
            <Reveal delay={100}>
              <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-extrabold text-brand-950">
                <Archive className="h-5 w-5 text-brand-600" aria-hidden="true" /> Archives
              </h2>
              {groups.size === 0 && <p className="text-sm text-ink-500">Les archives s'enrichiront au fil des publications.</p>}
              <div className="space-y-6">
                {[...groups.entries()].map(([month, meds]) => (
                  <div key={month}>
                    <p className="mb-2 text-xs font-bold tracking-[0.2em] text-brand-600 uppercase first-letter:uppercase">{month}</p>
                    <ul className="divide-y divide-brand-100 overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-brand-100">
                      {meds.map((m) => (
                        <li key={m.id}>
                          <Link href={contentUrl(m)} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-brand-50">
                            <span className="font-display w-9 shrink-0 text-center text-xl font-extrabold text-brand-300 group-hover:text-flame-600">{formatDate(m.publishedAt, { day: "numeric" })}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[15px] font-bold text-brand-950 group-hover:text-brand-700">{m.title}</span>
                              <span className="text-xs text-ink-500">{m.verseRef} · {m.verseTranslation}</span>
                            </span>
                            <span aria-hidden="true" className="text-brand-300 transition group-hover:translate-x-1 group-hover:text-brand-700">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        ) : (
          <EmptyState title="La première méditation arrive bientôt" />
        )}
      </div>
    </>
  );
}