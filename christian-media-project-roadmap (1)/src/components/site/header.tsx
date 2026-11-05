"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X, Mail } from "lucide-react";
import { Logo } from "./ui";
import { formatDate } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/foi-et-bible", label: "Foi & Bible" },
  { href: "/meditations", label: "Méditations" },
  { href: "/temoignages", label: "Témoignages" },
  { href: "/videos-podcasts", label: "Vidéos & podcasts" },
  { href: "/evenements", label: "Événements" },
  { href: "/a-propos", label: "À propos" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const today = useRef(formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" }));

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/recherche?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Bandeau verset */}
      <div className="bg-brand-950 text-brand-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11.5px] sm:px-6">
          <p className="hidden capitalize sm:block">{today.current}</p>
          <p className="truncate">
            <span className="text-flame-400" aria-hidden="true">✦ </span>
            « Ta parole est une lampe à mes pieds » — <span className="font-semibold text-white">Psaume 119.105</span>
          </p>
          <Link href="/newsletter" className="hidden shrink-0 font-semibold text-brand-200 hover:text-white sm:block">La lettre hebdo →</Link>
        </div>
      </div>

      {/* Barre principale */}
      <div className={`border-b border-brand-100 bg-white/92 backdrop-blur-md transition-shadow ${scrolled ? "shadow-[0_6px_24px_-12px_rgb(4_50_110/0.25)]" : ""}`}>
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Navigation principale" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`relative rounded-lg px-2.5 py-2 text-[13px] font-bold transition-colors ${
                      isActive(item.href) ? "text-brand-900" : "text-ink-500 hover:bg-brand-50 hover:text-brand-800"
                    }`}
                  >
                    {item.label}
                    {isActive(item.href) && <span className="absolute inset-x-2.5 -bottom-[3px] h-[3px] rounded-full bg-flame-500" aria-hidden="true" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-800 transition hover:bg-brand-50"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              href="/newsletter"
              className="hidden items-center gap-2 rounded-full bg-brand-900 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-brand-700 sm:inline-flex"
            >
              <Mail className="h-4 w-4" aria-hidden="true" /> S'abonner
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-900 transition hover:bg-brand-50 xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {open && (
          <nav aria-label="Menu mobile" className="border-t border-brand-100 bg-white xl:hidden">
            <ul className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-bold ${
                      isActive(item.href) ? "bg-brand-50 text-brand-900" : "text-ink-700 hover:bg-brand-50"
                    }`}
                  >
                    {item.label}
                    {isActive(item.href) && <span className="h-2 w-2 rounded-full bg-flame-500" aria-hidden="true" />}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex gap-2 border-t border-brand-100 pt-3">
                <Link href="/newsletter" className="flex-1 rounded-xl bg-brand-900 px-4 py-3 text-center text-sm font-bold text-white">S'abonner à la lettre</Link>
                <Link href="/contact" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800">Contact</Link>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Recherche */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-brand-950/80 px-4 pt-[18vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Recherche" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submitSearch} className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center gap-3 px-5 py-4">
                <Search className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher un article, une méditation, un épisode…"
                  className="w-full bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-300"
                  aria-label="Mots-clés"
                />
                <button type="submit" className="rounded-full bg-brand-900 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">Chercher</button>
              </div>
              <div className="border-t border-brand-100 bg-brand-50 px-5 py-3 text-xs text-ink-500">
                Suggestions : <button type="button" className="font-semibold text-brand-700 hover:underline" onClick={() => setQ("grâce")}>grâce</button> · <button type="button" className="font-semibold text-brand-700 hover:underline" onClick={() => setQ("prière")}>prière</button> · <button type="button" className="font-semibold text-brand-700 hover:underline" onClick={() => setQ("louange")}>louange</button>
              </div>
            </form>
            <button type="button" onClick={() => setSearchOpen(false)} className="mx-auto mt-4 block text-sm font-semibold text-brand-200 hover:text-white">
              Fermer (Échap)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}