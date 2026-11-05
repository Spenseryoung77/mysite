import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { saveUserAction } from "@/app/admin/actions";
import { Flash } from "@/components/admin";
import { ROLES } from "@/lib/site";

const ERR: Record<string, string> = {
  new: "Nom, e-mail et mot de passe (10 caractères minimum) obligatoires.",
  self: "Vous ne pouvez pas retirer votre propre rôle d’administrateur.",
  role: "Rôle invalide.",
};

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const me = await requireUser("users");
  const sp = await searchParams;
  const list = await db.select().from(users).orderBy(asc(users.name));
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl font-black">Utilisateurs</h1>
      <Flash ok={sp.ok} err={sp.err} errMsg={ERR[sp.err ?? ""]} />
      <div className="card text-sm text-slate-700">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Administrateur</strong> : configuration, comptes et sécurité.</li>
          <li><strong>Responsable éditorial</strong> : validation, publication, accueil, rubriques, événements, messages.</li>
          <li><strong>Rédacteur</strong> : création et modification de ses brouillons, soumission à relecture.</li>
          <li><strong>Gestionnaire média</strong> : images, médias et crédits sur tous les contenus, sans publication.</li>
        </ul>
      </div>
      <section className="card">
        <h2 className="mb-4 font-display text-lg font-black">Créer un compte</h2>
        <form action={saveUserAction} className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="u-name">Nom</label><input id="u-name" name="name" required className="input w-full" /></div>
          <div><label className="label" htmlFor="u-email">E-mail</label><input id="u-email" name="email" type="email" required className="input w-full" /></div>
          <div><label className="label" htmlFor="u-pass">Mot de passe initial (10+ caractères)</label><input id="u-pass" name="password" type="password" minLength={10} required className="input w-full" autoComplete="new-password" /></div>
          <div><label className="label" htmlFor="u-role">Rôle</label>
            <select id="u-role" name="role" defaultValue="writer" className="input w-full">{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><button className="btn-primary">Créer</button></div>
        </form>
      </section>
      {list.map((u) => (
        <form key={u.id} action={saveUserAction} className="card grid items-end gap-3 sm:grid-cols-4">
          <input type="hidden" name="id" value={u.id} />
          <div><p className="font-semibold">{u.name}{u.id === me.id && " (vous)"}</p><p className="text-xs text-slate-500">{u.email}</p></div>
          <div><label className="label" htmlFor={`r-${u.id}`}>Rôle</label>
            <select id={`r-${u.id}`} name="role" defaultValue={u.role} className="input w-full">{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="label" htmlFor={`p-${u.id}`}>Nouveau mot de passe</label><input id={`p-${u.id}`} name="password" type="password" minLength={10} placeholder="inchangé" className="input w-full" autoComplete="new-password" /></div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={u.active} disabled={u.id === me.id} className="h-4 w-4" /> Actif</label>
            <button className="btn-primary">Enregistrer</button>
          </div>
        </form>
      ))}
    </div>
  );
}
