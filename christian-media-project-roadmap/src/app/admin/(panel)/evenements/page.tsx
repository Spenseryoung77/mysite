import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { eventSaveAction, eventDeleteAction } from "@/lib/admin-actions";
import { AdminHead, MsgBanner, Card, inputCls, labelCls, btnPrimary, btnGhost } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/confirm-button";
import { formatDateTime } from "@/lib/utils";
import type { EventItem } from "@/db/schema";

export const dynamic = "force-dynamic";

function toLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventForm({ e }: { e?: EventItem }) {
  return (
    <form action={eventSaveAction} className="mt-4 space-y-3 rounded-xl bg-brand-50/70 p-5">
      {e && <input type="hidden" name="id" value={e.id} />}
      <div><label className={labelCls}>Titre *</label><input name="title" defaultValue={e?.title} className={inputCls} required /></div>
      <div><label className={labelCls}>Description</label><textarea name="description" defaultValue={e?.description} rows={3} className={inputCls} /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className={labelCls}>Date & heure *</label><input type="datetime-local" name="startsAt" defaultValue={e ? toLocal(e.startsAt) : ""} className={inputCls} required /></div>
        <div><label className={labelCls}>Lieu</label><input name="location" defaultValue={e?.location} className={inputCls} /></div>
        <div><label className={labelCls}>Ville</label><input name="city" defaultValue={e?.city} className={inputCls} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className={labelCls}>Organisateur</label><input name="organizer" defaultValue={e?.organizer} className={inputCls} /></div>
        <div><label className={labelCls}>E-mail d'inscription</label><input name="registrationEmail" defaultValue={e?.registrationEmail ?? ""} className={inputCls} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
          <input type="checkbox" name="isOnline" defaultChecked={e?.isOnline} className="h-4 w-4 accent-brand-700" /> En ligne
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
          <input type="checkbox" name="isOrganizerOurs" defaultChecked={e?.isOrganizerOurs} className="h-4 w-4 accent-brand-700" /> Organisé par Paroles Inspirées
        </label>
        {e && (
          <label className="flex items-center gap-2 text-sm font-bold text-ink-700">
            Statut
            <select name="status" defaultValue={e.status} className={`${inputCls} !w-auto`}>
              <option value="published">Confirmé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </label>
        )}
      </div>
      <button type="submit" className={btnPrimary}>{e ? "Enregistrer les modifications" : "Créer l'événement"}</button>
    </form>
  );
}

export default async function EventsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; msg?: string }> }) {
  await requireUser(["admin", "editor"]);
  const sp = await searchParams;
  const rows = await db.select().from(events).orderBy(desc(events.startsAt));
  const now = new Date();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminHead title="Événements" sub="Créer, modifier, annuler ou archiver. Les événements passés basculent automatiquement en archive publique ; les annulés sont signalés comme tels." />
      <MsgBanner ok={sp.ok} err={sp.err} msg={sp.msg} />

      <details className="mb-6">
        <summary className={`${btnPrimary} cursor-pointer list-none`}>+ Nouvel événement</summary>
        <Card className="mt-4"><EventForm /></Card>
      </details>

      <div className="space-y-4">
        {rows.map((e) => {
          const past = e.startsAt < now;
          return (
            <Card key={e.id}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-brand-950">{e.title}</p>
                  <p className="text-xs text-ink-500">{formatDateTime(e.startsAt)} · {e.isOnline ? "En ligne" : e.city} · org. {e.organizer}</p>
                </div>
                {e.status === "cancelled" ? (
                  <span className="rounded-full bg-danger-100 px-2.5 py-1 text-[11px] font-bold text-danger-600">Annulé</span>
                ) : past ? (
                  <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold text-ink-500">Passé (archivé)</span>
                ) : (
                  <span className="rounded-full bg-success-100 px-2.5 py-1 text-[11px] font-bold text-success-600">À venir</span>
                )}
                <details>
                  <summary className={`${btnGhost} cursor-pointer list-none`}>Modifier / annuler</summary>
                  <div className="w-full"><EventForm e={e} /></div>
                </details>
                <form action={eventDeleteAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <ConfirmButton message={`Supprimer « ${e.title} » ?`}>Suppr.</ConfirmButton>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}