import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireUser, canPublish } from "@/lib/auth";
import { subscriberDeleteAction } from "@/lib/admin-actions";
import { AdminHead, MsgBanner, Card } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/confirm-button";
import { formatDate } from "@/lib/utils";
import { MailCheck, Hourglass, MailX } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewsletterAdmin({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const badge: Record<string, string> = {
    confirmed: "bg-success-100 text-success-600",
    pending: "bg-warn-100 text-warn-600",
    unsubscribed: "bg-ink-100 text-ink-500",
  };
  const label: Record<string, string> = { confirmed: "Confirmé", pending: "En attente", unsubscribed: "Désinscrit" };

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHead title="Newsletter" sub="Liste à accès limité. Chaque envoi contiendra un lien de désinscription effectif." />
      <MsgBanner msg={sp.msg} err={sp.err} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MailCheck, label: "Confirmés", value: count("confirmed"), cls: "bg-success-100 text-success-600" },
          { icon: Hourglass, label: "En attente de confirmation", value: count("pending"), cls: "bg-warn-100 text-warn-600" },
          { icon: MailX, label: "Désinscrits", value: count("unsubscribed"), cls: "bg-ink-100 text-ink-700" },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.cls}`}><s.icon className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p className="font-display text-2xl font-extrabold text-brand-950">{s.value}</p>
              <p className="text-xs font-bold text-ink-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-xs font-bold tracking-wide text-ink-500 uppercase">
                <th className="px-5 py-3.5">Adresse</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5">Inscription</th>
                <th className="px-5 py-3.5">Confirmation</th>
                {canPublish(user) && <th className="px-5 py-3.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-brand-50/50">
                  <td className="px-5 py-3.5 font-semibold text-ink-900">{r.email}</td>
                  <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge[r.status]}`}>{label[r.status]}</span></td>
                  <td className="px-5 py-3.5 text-ink-500">{formatDate(r.createdAt)}</td>
                  <td className="px-5 py-3.5 text-ink-500">{r.confirmedAt ? formatDate(r.confirmedAt) : "—"}</td>
                  {canPublish(user) && (
                    <td className="px-5 py-3.5 text-right">
                      <form action={subscriberDeleteAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmButton message={`Supprimer définitivement ${r.email} de la liste ?`}>Supprimer</ConfirmButton>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-500">Aucun inscrit pour le moment.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-4 text-xs text-ink-500">En production : brancher un prestataire d'envoi fiable (double opt-in, gestion des rebonds et des préférences) et limiter l'export de cette liste.</p>
    </div>
  );
}