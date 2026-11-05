import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireUser, ROLE_LABELS } from "@/lib/auth";
import { logout } from "@/lib/admin-actions";
import { getNewMessageCount } from "@/lib/data";
import { FlameMark } from "@/components/site/ui";
import { initials } from "@/lib/utils";
import AdminNav from "@/components/admin/nav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const newMessages = await getNewMessageCount();

  return (
    <div className="min-h-screen bg-brand-50/60">
      {/* Barre latérale (desktop) / supérieure (mobile) */}
      <aside className="dark-scroll fixed inset-x-0 top-0 z-40 bg-brand-950 lg:inset-y-0 lg:right-auto lg:flex lg:h-screen lg:w-64 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <FlameMark className="h-9 w-9" />
            <span className="font-display text-xs leading-tight font-extrabold tracking-[0.1em] text-white">
              PAROLES INSPIRÉES
              <span className="block text-[10px] font-bold tracking-[0.2em] text-flame-400">RÉDACTION</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/" className="rounded-lg bg-brand-900 p-2 text-brand-200 hover:text-white" aria-label="Voir le site"><ExternalLink className="h-4 w-4" /></Link>
            <form action={logout}>
              <button type="submit" className="rounded-lg bg-brand-900 p-2 text-brand-200 hover:text-white" aria-label="Se déconnecter"><LogOut className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
        <div className="pb-3 lg:flex-1 lg:overflow-y-auto lg:pb-0">
          <AdminNav role={user.role} newMessages={newMessages} />
        </div>
        <div className="hidden border-t border-brand-800 p-4 lg:block">
          <Link href="/" className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold text-brand-200 hover:bg-brand-900 hover:text-white">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Voir le site
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-brand-900/70 p-3">
            <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-flame-500 text-xs font-extrabold text-brand-950">{initials(user.name)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-white">{user.name}</p>
              <p className="truncate text-[11px] text-brand-300">{ROLE_LABELS[user.role]}</p>
            </div>
            <form action={logout}>
              <button type="submit" className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-800 hover:text-white" aria-label="Se déconnecter" title="Se déconnecter">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="px-4 pt-[140px] pb-16 sm:px-6 lg:pt-10 lg:pl-72 lg:pr-8">{children}</main>
    </div>
  );
}