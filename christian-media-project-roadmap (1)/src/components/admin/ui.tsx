import type { ReactNode } from "react";
import { STATUS_LABELS } from "@/lib/utils";

export const inputCls =
  "w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-200";
export const labelCls = "mb-1.5 block text-[13px] font-bold text-ink-700";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 ring-1 ring-brand-200 transition hover:bg-brand-100";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-ink-100 text-ink-700",
  review: "bg-warn-100 text-warn-600",
  scheduled: "bg-info-100 text-info-600",
  published: "bg-success-100 text-success-600",
  archived: "bg-danger-100 text-danger-600",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${STATUS_STYLES[status] ?? "bg-ink-100 text-ink-700"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function AdminHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-950">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const MSG_MAP: Record<string, { text: string; tone: string }> = {
  "1": { text: "Enregistré avec succès.", tone: "bg-success-100 text-success-600" },
  published: { text: "Contenu publié — visible immédiatement sur le site.", tone: "bg-success-100 text-success-600" },
  review: { text: "Contenu soumis à relecture.", tone: "bg-warn-100 text-warn-600" },
  draft: { text: "Contenu repassé en brouillon.", tone: "bg-ink-100 text-ink-700" },
  archived: { text: "Contenu archivé — il n'apparaît plus sur le site. Vous pouvez le restaurer.", tone: "bg-info-100 text-info-600" },
  supprime: { text: "Élément supprimé définitivement.", tone: "bg-danger-100 text-danger-600" },
  read: { text: "Message marqué comme lu.", tone: "bg-success-100 text-success-600" },
  new: { text: "Message marqué comme non lu.", tone: "bg-info-100 text-info-600" },
  approved: { text: "Proposition acceptée en brouillon.", tone: "bg-success-100 text-success-600" },
  droits: { text: "Votre rôle ne permet pas cette action (publication réservée aux responsables).", tone: "bg-danger-100 text-danger-600" },
  champs: { text: "Champs obligatoires manquants ou invalides (mot de passe : 8 caractères min).", tone: "bg-danger-100 text-danger-600" },
  existe: { text: "Un compte existe déjà avec cette adresse.", tone: "bg-danger-100 text-danger-600" },
  soi: { text: "Vous ne pouvez pas supprimer votre propre compte.", tone: "bg-danger-100 text-danger-600" },
  nom: { text: "Le nom est obligatoire.", tone: "bg-danger-100 text-danger-600" },
  titre: { text: "Le titre est obligatoire.", tone: "bg-danger-100 text-danger-600" },
};

export function MsgBanner({ msg, err, ok }: { msg?: string; err?: string; ok?: string }) {
  const key = msg ?? err ?? ok;
  if (!key) return null;
  const m = MSG_MAP[key] ?? { text: "Action effectuée.", tone: "bg-success-100 text-success-600" };
  return (
    <div role="status" className={`mb-6 rounded-xl px-4 py-3 text-sm font-bold ${m.tone}`}>
      {m.text}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-brand-100 ${className}`}>{children}</div>;
}