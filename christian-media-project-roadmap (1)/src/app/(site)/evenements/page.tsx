import type { Metadata } from "next";
import { MapPin, Video, Mail, CalendarX2, History, Info } from "lucide-react";
import { getEvents } from "@/lib/data";
import { EmptyState } from "@/components/site/ui";
import PageHero from "@/components/site/page-hero";
import Reveal from "@/components/site/reveal";
import type { EventItem } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Événements",
  description: "L'agenda des rendez-vous chrétiens francophones : concerts, formations, collectes. Les événements passés sont archivés, les annulations signalées.",
};

const timeFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
const dayFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", timeZone: "Europe/Paris" });
const monFmt = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "Europe/Paris" });
const fullFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

function EventRow({ e, muted = false, cancelled = false }: { e: EventItem; muted?: boolean; cancelled?: boolean }) {
  return (
    <div className={`flex flex-col gap-5 rounded-2xl p-6 ring-1 sm:flex-row ${cancelled ? "bg-danger-100/50 ring-danger-600/20" : muted ? "bg-white/70 ring-brand-100 opacity-80" : "bg-white shadow-[var(--shadow-card)] ring-brand-100"}`}>
      <div className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl text-white ${cancelled ? "bg-danger-600" : muted ? "bg-ink-300" : "bg-brand-900"}`}>
        <span className="font-display text-3xl leading-none font-extrabold">{dayFmt.format(e.startsAt)}</span>
        <span className="mt-1 text-[11px] font-bold tracking-widest uppercase">{monFmt.format(e.startsAt)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-display text-lg leading-snug font-extrabold ${cancelled ? "text-ink-500 line-through decoration-danger-600/60" : "text-brand-950"}`}>{e.title}</h3>
          {cancelled && <span className="inline-flex items-center gap-1 rounded-full bg-danger-600 px-2.5 py-0.5 text-[11px] font-bold text-white uppercase"><CalendarX2 className="h-3 w-3" aria-hidden="true" /> Annulé</span>}
          {muted && !cancelled && <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-bold text-ink-500 uppercase">Passé</span>}
        </div>
        <p className="mt-1 text-sm font-semibold text-brand-700 first-letter:uppercase">
          {fullFmt.format(e.startsAt)} · {timeFmt.format(e.startsAt)} <span className="font-normal text-ink-500">(heure de Paris)</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
          {e.isOnline ? <Video className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" /> : <MapPin className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />}
          {e.location}{e.city && !e.isOnline ? ` — ${e.city}` : ""}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">{e.description}</p>
        <p className="mt-3 text-xs text-ink-500">
          Organisateur : <span className="font-bold text-ink-700">{e.organizer}</span>
          {!e.isOrganizerOurs && <span className="ml-2 rounded-full bg-info-100 px-2 py-0.5 font-semibold text-info-600">Événement relayé — Paroles Inspirées n'est pas l'organisateur</span>}
        </p>
        {e.registrationEmail && !muted && !cancelled && (
          <a href={`mailto:${e.registrationEmail}?subject=${encodeURIComponent(`Inscription — ${e.title}`)}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
            <Mail className="h-4 w-4" aria-hidden="true" /> S'inscrire auprès de l'organisateur
          </a>
        )}
      </div>
    </div>
  );
}

export default async function EventsPage() {
  const { upcoming, cancelled, past } = await getEvents();
  return (
    <>
      <PageHero kicker="Agenda communautaire" title="Événements">
        Concerts, formations, collectes : les rendez-vous qui font vivre les communautés. Les événements relayés ne sont pas organisés par notre rédaction — vérifiez toujours auprès de l'organisateur.
      </PageHero>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h2 className="font-display mb-5 text-xl font-extrabold text-brand-950">À venir ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Aucun événement à venir pour le moment">
            <p>Proposez le vôtre via la <a href="/contact" className="link-underline font-semibold text-brand-700">page contact</a>.</p>
          </EmptyState>
        ) : (
          <div className="space-y-5">{upcoming.map((e, i) => <Reveal key={e.id} delay={i * 60}><EventRow e={e} /></Reveal>)}</div>
        )}

        {cancelled.length > 0 && (
          <>
            <h2 className="font-display mt-12 mb-5 text-xl font-extrabold text-brand-950">Annulés</h2>
            <div className="space-y-5">{cancelled.map((e) => <EventRow key={e.id} e={e} cancelled />)}</div>
          </>
        )}

        <h2 className="font-display mt-12 mb-5 flex items-center gap-2 text-xl font-extrabold text-brand-950"><History className="h-5 w-5 text-brand-600" aria-hidden="true" /> Événements passés</h2>
        {past.length === 0 ? (
          <p className="text-sm text-ink-500">L'archive se remplira après les premiers événements.</p>
        ) : (
          <div className="space-y-5">{past.map((e) => <EventRow key={e.id} e={e} muted />)}</div>
        )}

        <p className="mt-10 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-[13px] text-ink-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          Vous organisez un événement ouvert à tous ? Écrivez-nous via la page contact avec la date, le lieu, l'horaire (fuseau compris) et un contact d'inscription.
        </p>
      </div>
    </>
  );
}