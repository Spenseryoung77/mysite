import Link from "next/link";
import { Inbox, MessageSquareHeart, ShieldCheck, Lock } from "lucide-react";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireUser, canPublish } from "@/lib/auth";
import { messageStatusAction, approveTestimonyAction } from "@/lib/admin-actions";
import { AdminHead, MsgBanner, Card, btnGhost } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MSTATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Nouveau", cls: "bg-flame-100 text-flame-700" },
  read: { label: "Lu", cls: "bg-success-100 text-success-600" },
  archived: { label: "Archivé", cls: "bg-ink-100 text-ink-500" },
  approved: { label: "Accepté en brouillon", cls: "bg-info-100 text-info-600" },
};

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tab?: string; msg?: string; err?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === "temoignage" || sp.tab === "contact" ? sp.tab : "all";
  const rows = (await db.select().from(messages).orderBy(desc(messages.createdAt))).filter((m) => tab === "all" || m.kind === tab);
  const chip = (on: boolean) => `rounded-full px-4 py-2 text-xs font-bold transition ${on ? "bg-brand-900 text-white" : "bg-white text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50"}`;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHead title="Messages & propositions" sub="Accès limité à la rédaction. Les propositions de témoignage ne sont jamais publiées automatiquement." />
      <MsgBanner msg={sp.msg} err={sp.err} />
      <p className="mb-5 flex items-start gap-2 rounded-xl bg-info-100 px-4 py-3 text-[13px] text-ink-700">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-info-600" aria-hidden="true" />
        Ces messages contiennent des données personnelles : ne les transférez pas hors de l'équipe et supprimez-les une fois traités si la personne le demande.
      </p>
      <div className="mb-6 flex gap-2">
        <Link href="/admin/messages" className={chip(tab === "all")}>Tous</Link>
        <Link href="/admin/messages?tab=contact" className={chip(tab === "contact")}>Contact</Link>
        <Link href="/admin/messages?tab=temoignage" className={chip(tab === "temoignage")}>Propositions de témoignage</Link>
      </div>

      {rows.length === 0 && (
        <Card className="py-14 text-center">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-brand-300" aria-hidden="true" />
          <p className="text-sm text-ink-500">Aucun message dans cette boîte.</p>
        </Card>
      )}

      <div className="space-y-5">
        {rows.map((m) => {
          const st = MSTATUS[m.status] ?? MSTATUS.new;
          const isTem = m.kind === "temoignage";
          return (
            <Card key={m.id} className={m.status === "new" ? "ring-2 ring-flame-500/50" : ""}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isTem ? "bg-brand-900 text-flame-400" : "bg-brand-50 text-brand-700"}`}>
                    {isTem ? <MessageSquareHeart className="h-5 w-5" aria-hidden="true" /> : <Inbox className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-[15px] font-bold text-brand-950">{isTem ? "Proposition de témoignage" : m.subject}</p>
                    <p className="text-xs text-ink-500">
                      {m.name} · <a href={`mailto:${m.email}`} className="font-semibold text-brand-700 hover:underline">{m.email}</a> · {formatDateTime(m.createdAt)}
                      {isTem && m.format ? ` · format souhaité : ${m.format}` : ""}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${st.cls}`}>{st.label}</span>
              </div>
              <p className="mt-4 rounded-xl bg-brand-50/70 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-ink-700">{m.body}</p>
              {isTem && (
                <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1 font-bold text-success-600"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Consentement étude : {m.consent ? "oui" : "non"}</span>
                  {m.anonymous && <span className="rounded-full bg-brand-100 px-2 py-0.5 font-bold text-brand-800">Souhaite l'anonymat</span>}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={messageStatusAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value={m.status === "new" ? "read" : "new"} />
                  <button type="submit" className={btnGhost}>{m.status === "new" ? "Marquer lu" : "Marquer non lu"}</button>
                </form>
                {m.status !== "archived" && (
                  <form action={messageStatusAction}>
                    <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="archived" />
                    <button type="submit" className={btnGhost}>Archiver</button>
                  </form>
                )}
                {isTem && m.status !== "approved" && canPublish(user) && (
                  <form action={approveTestimonyAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="rounded-lg bg-brand-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700">Créer un brouillon à relire →</button>
                  </form>
                )}
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${isTem ? "Votre proposition de témoignage" : m.subject}`)}`} className={btnGhost}>Répondre par e-mail</a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}