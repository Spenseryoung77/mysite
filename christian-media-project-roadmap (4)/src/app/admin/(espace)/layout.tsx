import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import { Logo } from "@/components/Logo";
import { ROLES, can, type Role } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administration", robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const links: { href: string; label: string; show: boolean }[] = [
    { href: "/admin", label: "Tableau de bord", show: true },
    { href: "/admin/contenus", label: "Contenus", show: true },
    { href: "/admin/contenus/nouveau", label: "+ Nouveau contenu", show: true },
    { href: "/admin/accueil", label: "Page d’accueil", show: can(user.role, "homepage") },
    { href: "/admin/rubriques", label: "Rubriques, auteurs, émissions", show: can(user.role, "taxonomy") },
    { href: "/admin/evenements", label: "Événements", show: can(user.role, "events") },
    { href: "/admin/messages", label: "Messages & newsletter", show: can(user.role, "messages") },
    { href: "/admin/utilisateurs", label: "Utilisateurs", show: can(user.role, "users") },
    { href: "/admin/profil", label: "Mon compte", show: true },
  ];
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-4 lg:block">
          <Link href="/admin" aria-label="Tableau de bord"><Logo compact /></Link>
          <p className="text-xs text-slate-600 lg:mt-4">{user.name}<br /><span className="font-semibold text-brand">{ROLES[user.role as Role]}</span></p>
        </div>
        <nav aria-label="Administration" className="overflow-x-auto px-2 pb-3 lg:pb-0">
          <ul className="flex gap-1 lg:flex-col">
            {links.filter((l) => l.show).map((l) => (
              <li key={l.href}><Link href={l.href} className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-brand-50 hover:text-brand">{l.label}</Link></li>
            ))}
            <li><Link href="/" target="_blank" className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-brand-50">Voir le site ↗</Link></li>
            <li>
              <form action={logoutAction}><button className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50">Se déconnecter</button></form>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
