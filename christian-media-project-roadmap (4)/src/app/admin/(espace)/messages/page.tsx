import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, subscribers, testimonySubmissions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  deleteMessageAction, deleteSubmissionAction, deleteSubscriberAction, submissionStatusAction, submissionToDraftAction, toggleMessageAction,
} from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin-client";
import { formatDate } from "@/lib/site";

const SUB_STATUS: Record<string, string> = { nouveau: "Nouveau", en_cours: "En cours d’échange", retenu: "Retenu", refuse: "Non retenu" };

export default async function MessagesAdmin() {
  await requireUser("messages");
  const [msgs, subs, list] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200),
    db.select().from(testimonySubmissions).orderBy(desc(testimonySubmissions.createdAt)).limit(200),
    db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(500),
  ]);
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="font-display text-3xl font-black">Messages & newsletter</h1>
        <p className="text-sm text-slate-600">Données personnelles : accès limité. Supprimez les messages traités au-delà de 12 mois.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-black">Messages de contact ({msgs.length})</h2>
        {msgs.length === 0 && <p className="text-sm text-slate-500">Aucun message.</p>}
        {msgs.map((m) => (
          <article key={m.id} className={`card ${m.handled ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{m.subject || "(sans objet)"}</p>
                <p className="text-xs text-slate-500">{m.name} · <a className="link" href={`mailto:${m.email}`}>{m.email}</a> · {formatDate(m.createdAt, true)}</p>
              </div>
              <div className="flex gap-2">
                <form action={toggleMessageAction}>
                  <input type="hidden" name="id" value={m.id} />
                  {!m.handled && <input type="hidden" name="handled" value="on" />}
                  <button className="btn-ghost min-h-9 text-sm">{m.handled ? "Marquer non traité" : "Marquer traité"}</button>
                </form>
                <form action={deleteMessageAction}><input type="hidden" name="id" value={m.id} /><ConfirmSubmit message="Supprimer ce message ?">Supprimer</ConfirmSubmit></form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
          </article>
        ))}
      </section>

      <section id="temoignages" className="scroll-mt-6 space-y-3">
        <h2 className="font-display text-xl font-black">Propositions de témoignage ({subs.length})</h2>
        <p className="text-sm text-slate-600">Jamais publiées automatiquement. Créer un brouillon, échanger avec la personne, vérifier son accord, puis valider.</p>
        {subs.length === 0 && <p className="text-sm text-slate-500">Aucune proposition.</p>}
        {subs.map((s) => (
          <details key={s.id} className="card">
            <summary className="cursor-pointer">
              <span className="font-semibold">{s.title}</span>{" "}
              <span className="text-xs text-slate-500">— {s.name} · {formatDate(s.createdAt)} · {SUB_STATUS[s.status]}{s.wantsAnonymity ? " · anonymat demandé" : ""}</span>
            </summary>
            <p className="mt-2 text-xs text-slate-500"><a className="link" href={`mailto:${s.email}`}>{s.email}</a> · Consentement à la lecture : {s.consent ? "oui" : "non"}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{s.story}</p>
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <form action={submissionStatusAction} className="flex items-end gap-2">
                <input type="hidden" name="id" value={s.id} />
                <label className="sr-only" htmlFor={`ss-${s.id}`}>Statut</label>
                <select id={`ss-${s.id}`} name="status" defaultValue={s.status} className="input">
                  {Object.entries(SUB_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button className="btn-ghost text-sm">Mettre à jour</button>
              </form>
              <form action={submissionToDraftAction}><input type="hidden" name="id" value={s.id} /><button className="btn-primary text-sm">Créer un brouillon</button></form>
              <form action={deleteSubmissionAction}><input type="hidden" name="id" value={s.id} /><ConfirmSubmit message="Supprimer définitivement cette proposition ?">Supprimer</ConfirmSubmit></form>
            </div>
          </details>
        ))}
      </section>

      <section id="newsletter" className="scroll-mt-6 space-y-3">
        <h2 className="font-display text-xl font-black">Abonnés newsletter ({list.filter((l) => l.confirmed).length} confirmés / {list.length})</h2>
        <p className="text-sm text-slate-600">Pour l’envoi des campagnes, utiliser un prestataire fiable (configurer <code>RESEND_API_KEY</code> pour les e-mails de confirmation).</p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600"><tr><th className="p-3">E-mail</th><th className="p-3">Statut</th><th className="p-3">Inscription</th><th className="p-3"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((l) => (
                <tr key={l.id}>
                  <td className="p-3">{l.email}</td>
                  <td className="p-3">{l.confirmed ? "Confirmé" : "En attente"}</td>
                  <td className="p-3">{formatDate(l.createdAt)}</td>
                  <td className="p-3 text-right"><form action={deleteSubscriberAction}><input type="hidden" name="id" value={l.id} /><ConfirmSubmit message="Supprimer cet abonné ?">Supprimer</ConfirmSubmit></form></td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={4} className="p-6 text-center text-slate-500">Aucun abonné.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
