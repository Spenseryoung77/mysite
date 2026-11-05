"use client";

import { useState } from "react";
import { Link2, Check, Mail } from "lucide-react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold tracking-widest text-ink-500 uppercase">Partager</span>
      <button
        type="button"
        onClick={copy}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
          copied ? "bg-success-100 text-success-600" : "bg-brand-50 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
        }`}
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
        {copied ? "Lien copié !" : "Copier le lien"}
      </button>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent("À lire sur Paroles Inspirées : ")}%20`}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-800 ring-1 ring-brand-200 transition hover:bg-brand-100"
      >
        <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Par e-mail
      </a>
    </div>
  );
}