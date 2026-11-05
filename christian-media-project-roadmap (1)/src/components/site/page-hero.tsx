import type { ReactNode } from "react";
import { Kicker } from "./ui";

export default function PageHero({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-100/60">
      <svg viewBox="0 0 64 64" className="pointer-events-none absolute -right-8 -bottom-10 h-52 w-52 opacity-[0.05]" aria-hidden="true">
        <path d="M32 9c2.6 6.2 11 11.4 11 20.3C43 37.6 38.1 44 32 44s-11-6.4-11-14.7c0-3.6 1.3-6.7 3.3-9.8 1 2.7 2.5 4.4 4.6 5.5C28.2 20.6 29.6 14.6 32 9Z" fill="#04326E" />
      </svg>
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <Kicker>{kicker}</Kicker>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-500">{children}</div>}
      </div>
    </div>
  );
}