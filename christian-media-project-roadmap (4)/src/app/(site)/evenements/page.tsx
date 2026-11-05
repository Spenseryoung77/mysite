import type { Metadata } from "next";
import { pastEvents, upcomingEvents } from "@/lib/queries";
import { Badge, Empty, PageHero } from "@/components/content";
import type { EventRow } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Événements", description: "Les événements chrétiens à venir signalés par Paroles Inspirées." };

function fmt(e: EventRow) {
  return e.startsAt.toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: e.timezone, timeZoneName: "short",
  });
}

function EventItem({ e, past }: { e: EventRow; past?: boolean }) {
  const cancelled = e.status === "annule";
  return (
    <li className={`card ${past || cancelled ? "opacity-80" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        {cancelled && <Badge tone="amber">Annulé</Badge>}
        {past && <Badge tone="slate">Passé</Badge>}
        {!e.isOrganizer && <Badge tone="slate">Organisé par un partenaire</Badge>}
      </div>
      <h3 className={`mt-2 font-display text-xl font-bold ${cancelled ? "line-through" : ""}`}>{e.title}</h3>
      <p className="mt-1 font-semibold capitalize text-brand">{fmt(e)}</p>
      <dl className="mt-3 grid gap-1 text-sm text-slate-700">
        {e.location && <div><dt className="inline font-semibold">Lieu : </dt><dd className="inline">{e.location}</dd></div>}
        {e.onlineUrl && <div><dt className="inline font-semibold">En ligne : </dt><dd className="inline"><a className="link break-all" href={e.onlineUrl} target="_blank" rel="noopener noreferrer">{e.onlineUrl}</a></dd></div>}
        {e.organizer && <div><dt className="inline font-semibold">Organisateur : </dt><dd className="inline">{e.organizer}{!e.isOrganizer && " (Paroles Inspirées n’est pas l’organisateur)"}</dd></div>}
        {e.contact && <div><dt className="inline font-semibold">Contact : </dt><dd className="inline">{e.contact}</dd></div>}
      </dl>
      {e.description && <p className="mt-3 text-slate-700">{e.description}</p>}
      {e.registrationUrl && !past && !cancelled && (
        <a href={e.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">S’inscrire auprès de l’organisateur ↗</a>
      )}
    </li>
  );
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([upcomingEvents(50), pastEvents(20)]);
  return (
    <>
      <PageHero kicker="Agenda" title="Événements" description="Rencontres, conférences et temps forts utiles à la communauté." />
      <div className="container-pi space-y-12 py-10">
        <section aria-labelledby="avenir">
          <h2 id="avenir" className="mb-5 font-display text-2xl font-black">À venir</h2>
          {upcoming.length ? <ul className="grid gap-5 md:grid-cols-2">{upcoming.map((e) => <EventItem key={e.id} e={e} />)}</ul> : <Empty>Aucun événement à venir pour le moment.</Empty>}
        </section>
        {past.length > 0 && (
          <section aria-labelledby="passes">
            <h2 id="passes" className="mb-5 font-display text-2xl font-black">Archives</h2>
            <ul className="grid gap-5 md:grid-cols-2">{past.map((e) => <EventItem key={e.id} e={e} past />)}</ul>
          </section>
        )}
      </div>
    </>
  );
}
