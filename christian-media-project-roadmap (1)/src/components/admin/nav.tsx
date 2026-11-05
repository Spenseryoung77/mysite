"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Inbox, Mail, Home, Users, Radio, CalendarDays, KeyRound } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/contenus", label: "Contenus", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/accueil", label: "Accueil du site", icon: Home },
  { href: "/admin/auteurs", label: "Auteurs", icon: Users },
  { href: "/admin/emissions", label: "Émissions", icon: Radio },
  { href: "/admin/evenements", label: "Événements", icon: CalendarDays },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: KeyRound, adminOnly: true },
];

export default function AdminNav({ role, newMessages }: { role: string; newMessages: number }) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => !i.adminOnly || role === "admin");
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav aria-label="Navigation administration" className="flex gap-1 overflow-x-auto px-3 lg:flex-col lg:overflow-visible">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={active(i.href) ? "page" : undefined}
          className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-bold whitespace-nowrap transition ${
            active(i.href) ? "bg-brand-800 text-white shadow-inner" : "text-brand-200 hover:bg-brand-900 hover:text-white"
          }`}
        >
          <i.icon className={`h-4 w-4 shrink-0 ${active(i.href) ? "text-flame-400" : ""}`} aria-hidden="true" />
          {i.label}
          {i.href === "/admin/messages" && newMessages > 0 && (
            <span className="ml-auto rounded-full bg-flame-500 px-2 py-0.5 text-[10px] font-extrabold text-brand-950">{newMessages}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}