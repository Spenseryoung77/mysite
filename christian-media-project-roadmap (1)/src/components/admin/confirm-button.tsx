"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export default function ConfirmButton({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? "inline-flex items-center gap-1 rounded-lg bg-danger-100 px-3 py-1.5 text-xs font-bold text-danger-600 transition hover:bg-danger-600 hover:text-white disabled:opacity-60"}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}