import { desc } from "drizzle-orm";
import { db } from "@/db";
import { events, type EventRow } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { deleteEventAction, saveEventAction } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin-client";
import { Flash, toLocalInput } from "@/components/admin";
import { formatDate } from "@/lib/site";

function EventForm({ e }: { e?: EventRow }) {
  const p = e ? `e${e.id}` : "new";
  return (
    <form action={saveEventAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={e?.id ?? ""} />
      <div className="sm:col-span-2"><label className="label" htmlFor={`${p}-t`}>Titre *</label><input id={`${p}-t`} name="title" required defaultValue={e?.title} className="input w-full" /></div>
      <div><label className="label" htmlFor={`${p}-d`}>Date et heure *</label><input id={`${p}-d`} name="startsAt" type="datetime-local" required defaultValue={toLocalInput(e?.startsAt)} className="input w-full" /></div>
      <div><label className="label" htmlFor={`${p}-tz`}>Fuseau horaire</label>
        <select id={`${p}-tz`} name="timezone" defaultValue={e?.timezone ?? "Europe/Paris"} className="input w-full">
          {["Europe/Paris", "Europe/Brussels", "Europe/Zurich", "America/Montreal", "Africa/Abidjan", "Africa/Dakar", "Africa/Douala", "Africa/Kinshasa", "Indian/Reunion", "America/Martinique"].map((z) => <option key={z}>{z}</option>)}
        </select></div>
      <div><label className="label" htmlFor={`${p}-l`}>Lieu</label><input id={`${p}-l`} name="location" defaultValue={e?.location ?? ""} className="input w-full" /></div>
      <div><label className="label" htmlFor={`${p}-o`}>Lien en ligne</label><input id={`${p}-o`} name="onlineUrl" type="url" defaultValue={e?.onlineUrl ?? ""} className="input w-full" /></div>
      <div><label className="label" htmlFor={`${p}-org`}>Organisateur</label><input id={`${p}-org`} name="organizer" defaultValue={e?.organizer ?? ""} className="input w-full" /></div>
      <div><label className="label" htmlFor={`${p}-c`}>Coordonnées</label><input id={`${p}-c`} name="contact" defaultValue={e?.contact ?? ""} className="input w-full" /></div>
      <div><label className="label" htmlFor={`${p}-r`}>Lien d’inscription externe</label><input id={`${p}-r`} name="registrationUrl" type="url" defaultValue={e?.registrationUrl ?? ""} className="input w-full" /></div>
      <div><label className="label" htmlFor={`${p}-s`}>Statut</label>
        <select id={`${p}-s`} name="status" defaultValue={e?.status ?? "actif"} className="input w-full"><option value="actif">Actif</option><option value="annule">Annulé</option><option value="archive">Archivé</option></select></div>
      <div className="sm:col-span-2"><label className="label" htmlFor={`${p}-desc`}>Description</label><textarea id={`${p}-desc`} name="description" rows={3} defaultValue={e?.description ?? ""} className="input w-full" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isOrganizer" defaultChecked={e?.isOrganizer} className="h-4 w-4" /> Paroles Inspirées est l’organisateur</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={e?.published ?? true} className="h-4 w-4" /> Visible sur le site</label>
      <div><button className="btn-primary">{e ? "Enregistrer" : "Créer l’événement"}</button></div>
    </form>
  );
}

export default async function EventsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireUser("events");
  const sp = await searchParams;
  const list = await db.select().from(events).orderBy(desc(events.startsAt));
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl font-black">Événements</h1>
      <Flash ok={sp.ok} err={sp.err} errMsg="Titre et date obligatoires." />
      <section className="card"><h2 className="mb-4 font-display text-lg font-black">Nouvel événement</h2><EventForm /></section>
      {list.map((e) => (
        <details key={e.id} className="card">
          <summary className="cursor-pointer font-semibold">
            {e.title} <span className="font-normal text-slate-500">— {formatDate(e.startsAt, true)} · {e.status}{e.startsAt < new Date() ? " · passé" : ""}</span>
          </summary>
          <div className="mt-4"><EventForm e={e} /></div>
          <form action={deleteEventAction} className="mt-3"><input type="hidden" name="id" value={e.id} /><ConfirmSubmit message="Supprimer cet événement ?">Supprimer</ConfirmSubmit></form>
        </details>
      ))}
    </div>
  );
}
