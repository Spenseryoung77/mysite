"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, subscribers, testimonySubmissions } from "@/db/schema";
import { SITE } from "@/lib/site";

export type FormState = { ok: boolean; message: string; link?: string } | null;

const hits = new Map<string, number[]>();
async function rateLimited(bucket: string, max = 5, windowMs = 10 * 60 * 1000) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  return host ? `${proto}://${host}` : SITE.url;
}

async function sendMail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "Paroles Inspirées <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function subscribeAction(_: FormState, form: FormData): Promise<FormState> {
  if (str(form, "website")) return { ok: true, message: "Merci !" };
  if (await rateLimited("newsletter")) return { ok: false, message: "Trop de tentatives. Réessayez plus tard." };
  const email = str(form, "email", 200).toLowerCase();
  if (!isEmail(email)) return { ok: false, message: "Veuillez saisir une adresse e-mail valide." };

  const existing = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
  let token = existing[0]?.token;
  if (existing[0]?.confirmed) return { ok: true, message: "Cette adresse est déjà inscrite. Merci !" };
  if (!token) {
    token = randomBytes(24).toString("hex");
    await db.insert(subscribers).values({ email, token });
  }
  const link = `${await siteUrl()}/newsletter?confirmer=${token}`;
  const sent = await sendMail(
    email,
    "Confirmez votre inscription — Paroles Inspirées",
    `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
      <div style="background:#04326E;color:#fff;padding:20px;border-radius:12px 12px 0 0;font-weight:900;letter-spacing:1px">PAROLES INSPIRÉES</div>
      <div style="padding:20px;border:1px solid #EFF5FC">
      <p>Merci pour votre intérêt ! Pour confirmer votre inscription à la newsletter, cliquez ci-dessous :</p>
      <p><a href="${link}" style="background:#04326E;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Confirmer mon inscription</a></p>
      <p style="color:#555;font-size:12px">Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p></div></div>`,
  );
  if (sent) return { ok: true, message: "Presque fini ! Un e-mail de confirmation vient de vous être envoyé." };
  return {
    ok: true,
    message:
      "Inscription enregistrée. Aucun service d’envoi d’e-mails n’est encore configuré : utilisez ce lien pour confirmer (mode test).",
    link,
  };
}

export async function contactAction(_: FormState, form: FormData): Promise<FormState> {
  if (str(form, "website")) return { ok: true, message: "Merci, votre message a bien été envoyé." };
  if (await rateLimited("contact", 3)) return { ok: false, message: "Trop de messages envoyés. Réessayez plus tard." };
  const name = str(form, "name", 120);
  const email = str(form, "email", 200);
  const subject = str(form, "subject", 200);
  const message = str(form, "message", 5000);
  if (!name || !message) return { ok: false, message: "Le nom et le message sont obligatoires." };
  if (!isEmail(email)) return { ok: false, message: "Veuillez saisir une adresse e-mail valide." };
  if (message.length < 10) return { ok: false, message: "Votre message est trop court." };
  await db.insert(contactMessages).values({ name, email, subject, message });
  return { ok: true, message: "Merci, votre message a bien été transmis à l’équipe. Vos coordonnées ne seront jamais publiées." };
}

export async function testimonyAction(_: FormState, form: FormData): Promise<FormState> {
  if (str(form, "website")) return { ok: true, message: "Merci pour votre confiance." };
  if (await rateLimited("temoignage", 3)) return { ok: false, message: "Trop d’envois. Réessayez plus tard." };
  const name = str(form, "name", 120);
  const email = str(form, "email", 200);
  const title = str(form, "title", 200);
  const story = str(form, "story", 10000);
  const consent = form.get("consent") === "on";
  if (!name || !title || !story) return { ok: false, message: "Merci de remplir tous les champs obligatoires." };
  if (!isEmail(email)) return { ok: false, message: "Veuillez saisir une adresse e-mail valide." };
  if (story.length < 50) return { ok: false, message: "Votre témoignage doit contenir au moins 50 caractères." };
  if (!consent) return { ok: false, message: "Votre accord est nécessaire pour que la rédaction puisse lire votre proposition." };
  await db.insert(testimonySubmissions).values({
    name, email, title, story, consent, wantsAnonymity: form.get("anonymous") === "on",
  });
  return {
    ok: true,
    message:
      "Merci pour votre confiance. Votre proposition est privée : la rédaction la lira et vous recontactera avant toute éventuelle publication.",
  };
}
