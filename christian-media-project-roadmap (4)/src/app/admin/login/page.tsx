import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/admin-client";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connexion — Administration", robots: { index: false } };

export default async function LoginPage() {
  await ensureSeed();
  if (await getCurrentUser()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center"><Logo /></div>
        <h1 className="mb-6 text-center font-display text-xl font-black">Espace rédaction</h1>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-slate-500">Accès réservé à l’équipe. Chaque membre dispose de son propre compte.</p>
      </div>
    </main>
  );
}
