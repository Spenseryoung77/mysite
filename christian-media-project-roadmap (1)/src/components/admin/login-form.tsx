"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/admin-actions";
import { AlertCircle, LogIn } from "lucide-react";
import { inputCls, labelCls, btnPrimary } from "./ui";

export default function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const r = await login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
      if (r.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(r.error ?? "Connexion impossible.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className={labelCls}>Adresse e-mail professionnelle</label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue="admin@paroles-inspirees.org" className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className={labelCls}>Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" defaultValue="Flamme!2026" className={inputCls} />
      </div>
      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-danger-100 px-3 py-2.5 text-sm font-semibold text-danger-600" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        <LogIn className="h-4 w-4" aria-hidden="true" /> {pending ? "Connexion…" : "Se connecter"}
      </button>
      <p className="text-center text-xs text-ink-500">Comptes individuels · session chiffrée · double authentification à activer en production</p>
    </form>
  );
}