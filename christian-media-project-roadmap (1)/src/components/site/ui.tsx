import Link from "next/link";
import type { ReactNode } from "react";
import { initials } from "@/lib/utils";
import type { Author } from "@/db/schema";

export function FlameMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="currentColor" className="text-brand-900" />
      <path d="M32 9c2.6 6.2 11 11.4 11 20.3C43 37.6 38.1 44 32 44s-11-6.4-11-14.7c0-3.6 1.3-6.7 3.3-9.8 1 2.7 2.5 4.4 4.6 5.5C28.2 20.6 29.6 14.6 32 9Z" fill="#fff" />
      <path d="M32 44c-3.1 0-5.4-2.7-5.4-6.4 0-3.1 2.4-5.8 5.4-8.7 3 2.9 5.4 5.6 5.4 8.7 0 3.7-2.3 6.4-5.4 6.4Z" fill="#04326E" />
      <path d="M32 41.2c-1.6 0-2.7-1.4-2.7-3.3 0-1.6 1.2-3 2.7-4.5 1.5 1.5 2.7 2.9 2.7 4.5 0 1.9-1.1 3.3-2.7 3.3Z" fill="#F5B942" />
      <path d="M20 50h24" stroke="#F5B942" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ dark = false, small = false }: { dark?: boolean; small?: boolean }) {
  return (
    <Link href="/" aria-label="Paroles Inspirées — accueil" className="group flex shrink-0 items-center gap-2.5">
      <FlameMark className={small ? "h-9 w-9" : "h-10 w-10 transition-transform duration-300 group-hover:scale-105"} />
      <span className={`font-display leading-[0.95] font-extrabold tracking-[0.08em] ${small ? "text-[13px]" : "text-sm"} ${dark ? "text-white" : "text-brand-900"}`}>
        PAROLES
        <br />
        INSPIRÉES
      </span>
    </Link>
  );
}

export function Kicker({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase ${dark ? "text-flame-400" : "text-brand-600"}`}>
      <span className={`inline-block h-px w-6 ${dark ? "bg-flame-400" : "bg-brand-600"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

export function SectionHead({ kicker, title, href, linkLabel = "Tout voir", dark = false }: { kicker: string; title: string; href?: string; linkLabel?: string; dark?: boolean }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Kicker dark={dark}>{kicker}</Kicker>
        <h2 className={`font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl ${dark ? "text-white" : "text-brand-950"}`}>{title}</h2>
      </div>
      {href && (
        <Link href={href} className={`link-underline text-sm font-bold ${dark ? "text-flame-400 hover:text-flame-500" : "text-brand-700 hover:text-brand-900"}`}>
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export function Chip({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "gold" | "white" }) {
  const cls =
    tone === "gold"
      ? "bg-flame-500 text-brand-950"
      : tone === "white"
        ? "bg-white/90 text-brand-900 backdrop-blur"
        : "bg-brand-50 text-brand-700 ring-1 ring-brand-200";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${cls}`}>{children}</span>;
}

export function Avatar({ author, size = "md" }: { author: Author | null; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-xs";
  return (
    <span
      className={`inline-flex ${s} shrink-0 items-center justify-center rounded-full font-display font-extrabold text-white ring-2 ring-white/60`}
      style={{ backgroundColor: author?.color ?? "#0A4C9E" }}
      aria-hidden="true"
    >
      {author ? initials(author.name) : "PI"}
    </span>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-500">
        <li><Link href="/" className="link-underline hover:text-brand-700">Accueil</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-brand-300">/</span>
            {it.href ? (
              <Link href={it.href} className="link-underline hover:text-brand-700">{it.label}</Link>
            ) : (
              <span className="max-w-[40ch] truncate font-semibold text-ink-700" aria-current="page">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function VerseBlock({ reference, text, translation }: { reference: string; text: string; translation?: string | null }) {
  return (
    <figure className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 p-7 text-white shadow-[var(--shadow-card)] sm:p-9">
      <svg viewBox="0 0 64 64" className="absolute -right-4 -bottom-6 h-36 w-36 opacity-[0.08]" aria-hidden="true">
        <path d="M32 9c2.6 6.2 11 11.4 11 20.3C43 37.6 38.1 44 32 44s-11-6.4-11-14.7c0-3.6 1.3-6.7 3.3-9.8 1 2.7 2.5 4.4 4.6 5.5C28.2 20.6 29.6 14.6 32 9Z" fill="#fff" />
      </svg>
      <span className="font-display text-5xl leading-none font-extrabold text-flame-400" aria-hidden="true">«</span>
      <blockquote className="relative mt-1 font-display text-xl leading-snug font-bold text-balance sm:text-2xl">{text}</blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-bold text-flame-400">{reference}</span>
        {translation && <span className="text-brand-200">— {translation}</span>}
      </figcaption>
    </figure>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 px-8 py-14 text-center">
      <FlameMark className="mx-auto mb-4 h-12 w-12 opacity-70" />
      <p className="font-display text-lg font-bold text-brand-900">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-ink-500">{children}</div>}
    </div>
  );
}