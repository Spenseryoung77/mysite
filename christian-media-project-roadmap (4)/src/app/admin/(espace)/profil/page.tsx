import { requireUser } from "@/lib/auth";
import { changeOwnPasswordAction } from "@/app/admin/actions";
import { Flash } from "@/components/admin";
import { ROLES, type Role } from "@/lib/site";

export default async function Profile({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const me = await requireUser();
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-3xl font-black">Mon compte</h1>
      <div className="card text-sm"><p><strong>{me.name}</strong> — {me.email}</p><p className="text-slate-600">{ROLES[me.role as Role]}</p></div>
      <Flash ok={sp.ok} err={sp.err} okMsg="Mot de passe modifié." errMsg="Mot de passe actuel incorrect ou nouveau mot de passe trop court (10 caractères minimum)." />
      <form action={changeOwnPasswordAction} className="card space-y-4">
        <h2 className="font-display text-lg font-black">Changer de mot de passe</h2>
        <div><label className="label" htmlFor="cur">Mot de passe actuel</label><input id="cur" name="current" type="password" required className="input w-full" autoComplete="current-password" /></div>
        <div><label className="label" htmlFor="nxt">Nouveau mot de passe</label><input id="nxt" name="next" type="password" minLength={10} required className="input w-full" autoComplete="new-password" /></div>
        <button className="btn-primary">Mettre à jour</button>
      </form>
    </div>
  );
}
