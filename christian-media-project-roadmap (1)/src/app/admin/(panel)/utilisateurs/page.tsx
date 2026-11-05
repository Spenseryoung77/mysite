import { db } from "@/db";
import { users } from "@/db/schema";
import { asc } from "drizzle-orm";
import { requireUser, ROLE_LABELS } from "@/lib/auth";
import { userCreateAction, userDeleteAction } from "@/lib/admin-actions";
import { AdminHead, MsgBanner, Card, inputCls, labelCls, btnPrimary } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/confirm-button";
import { formatDate, initials } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; msg?: string }> }) {
  const current = await requireUser(["admin"]);
  const sp = await searchParams;
  const rows = await db.select().from(users).orderBy(asc(users.id));

  return (
    <div className="mx-auto max-w-4xl">
      <AdminHead title="Utilisateurs & permissions" sub="Chaque personne dispose de son propre compte, avec le rôle le plus limité possible." />
      <MsgBanner ok={sp.ok} err={sp.err} msg={sp.msg} />

      <div className="mb-6 grid gap-3 sm:grid-cols-3 text-[13px]">
        {[
          { r: "Administrateur", d: "Configuration, comptes, sécurité et tout le contenu." },
          { r: "Responsable éditorial", d: "Validation, publication, programmation, réglages de l'accueil." },
          { r: "Rédacteur", d: "Création et modification de brouillons, soumission à relecture." },
        ].map((x) => (
          <div key={x.r} className="rounded-xl bg-white p-4 ring-1 ring-brand-100">
            <p className="font-bold text-brand-900">{x.r}</p>
            <p className="mt-1 text-ink-500">{x.d}</p>
          </div>
        ))}
      </div>

      <Card className="!p-0">
        <ul className="divide-y divide-brand-100">
          {rows.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span className="font-display flex h-10 w-10 items-center justify-center rounded-full bg-brand-900 text-xs font-extrabold text-white">{initials(u.name)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-brand-950">{u.name} {u.id === current.id && <span className="ml-1 rounded-full bg-flame-100 px-2 py-0.5 text-[10px] font-bold text-flame-700">vous</span>}</p>
                <p className="text-xs text-ink-500">{u.email} · créé le {formatDate(u.createdAt)}</p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 ring-1 ring-brand-200">{ROLE_LABELS[u.role]}</span>
              {u.id !== current.id && (
                <form action={userDeleteAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <ConfirmButton message={`Supprimer le compte de ${u.name} ? Ses contenus resteront publiés.`}>Supprimer</ConfirmButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display mb-4 text-base font-extrabold text-brand-950">Créer un compte</h2>
        <form action={userCreateAction} className="grid gap-3 sm:grid-cols-2">
          <div><label className={labelCls}>Nom complet *</label><input name="name" className={inputCls} required /></div>
          <div><label className={labelCls}>E-mail professionnel *</label><input name="email" type="email" className={inputCls} required /></div>
          <div>
            <label className={labelCls}>Rôle</label>
            <select name="role" className={inputCls} defaultValue="redacteur">
              <option value="redacteur">Rédacteur</option>
              <option value="editor">Responsable éditorial</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div><label className={labelCls}>Mot de passe provisoire * (8 caractères min)</label><input name="password" type="text" className={inputCls} required minLength={8} /></div>
          <div className="sm:col-span-2"><button type="submit" className={btnPrimary}>Créer le compte</button></div>
        </form>
      </Card>

      <p className="mt-5 flex items-start gap-2 text-xs text-ink-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
        En production : activer la double authentification pour les administrateurs (et si possible toute la rédaction), limiter les tentatives de connexion et tester régulièrement la restauration des sauvegardes.
      </p>
    </div>
  );
}