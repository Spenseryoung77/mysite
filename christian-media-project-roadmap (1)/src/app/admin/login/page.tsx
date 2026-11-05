import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { FlameMark } from "@/components/site/ui";
import LoginForm from "@/components/admin/login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Espace rédaction — Connexion", robots: { index: false } };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-950 px-4 py-12">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-700/40 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-flame-600/20 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <FlameMark className="mx-auto h-14 w-14" />
          <p className="font-display mt-4 text-sm font-extrabold tracking-[0.2em] text-white">PAROLES INSPIRÉES</p>
          <p className="mt-1 text-sm text-brand-300">Espace rédaction — accès réservé à l'équipe</p>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <LoginForm />
          <div className="mt-6 rounded-xl bg-brand-50 p-4 text-xs leading-relaxed text-ink-500">
            <p className="mb-1 font-bold text-brand-800">Comptes de démonstration</p>
            <p><strong>admin@paroles-inspirees.org</strong> — administratrice</p>
            <p><strong>s.rakoto@paroles-inspirees.org</strong> — responsable éditorial</p>
            <p><strong>d.nguessan@paroles-inspirees.org</strong> — rédacteur</p>
            <p className="mt-1.5">Mot de passe commun : <code className="rounded bg-brand-100 px-1.5 py-0.5 font-bold text-brand-900">Flamme!2026</code></p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-brand-300">
          <Link href="/" className="link-underline hover:text-white">← Retour au site public</Link>
        </p>
      </div>
    </div>
  );
}