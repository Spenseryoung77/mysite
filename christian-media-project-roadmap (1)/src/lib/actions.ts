"use server";

import { db } from "@/db";
import { messages, subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; message: string; confirmUrl?: string }> {
  const clean = email.trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) return { ok: false, message: "Cette adresse e-mail ne semble pas valide." };
  const existing = await db.select().from(subscribers).where(eq(subscribers.email, clean)).limit(1);
  if (existing[0]?.status === "confirmed") {
    return { ok: true, message: "Vous êtes déjà inscrit(e) — merci pour votre fidélité !" };
  }
  let token: string;
  if (existing[0]) {
    token = existing[0].status === "pending" ? existing[0].token : randomUUID();
    await db.update(subscribers).set({ status: "pending", token }).where(eq(subscribers.id, existing[0].id));
  } else {
    token = randomUUID();
    await db.insert(subscribers).values({ email: clean, token });
  }
  revalidatePath("/admin/newsletter");
  return {
    ok: true,
    message: "Presque terminé ! Confirmez votre inscription pour recevoir la lettre.",
    confirmUrl: `/newsletter/confirmation?token=${token}`,
  };
}

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  body: string;
  website?: string; // pot de miel
  elapsed?: number;
};

export async function submitContact(input: ContactInput): Promise<{ ok: boolean; message: string }> {
  if (input.website) return { ok: true, message: "Merci, votre message a bien été envoyé." }; // leurre anti-spam
  if ((input.elapsed ?? 99999) < 2500) return { ok: false, message: "Envoi trop rapide — veuillez patienter quelques secondes puis réessayer." };
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const body = input.body.trim();
  if (name.length < 2) return { ok: false, message: "Merci d'indiquer votre nom." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Cette adresse e-mail ne semble pas valide." };
  if (body.length < 20) return { ok: false, message: "Votre message est un peu court (20 caractères minimum)." };
  await db.insert(messages).values({ kind: "contact", name, email, subject: input.subject.trim() || "Message depuis le site", body });
  revalidatePath("/admin/messages");
  return { ok: true, message: "Merci ! Votre message est arrivé à la rédaction. Nous répondons sous quelques jours ouvrés." };
}

export type TestimonyInput = {
  name: string;
  email: string;
  body: string;
  format: string;
  anonymous: boolean;
  consent: boolean;
  website?: string;
  elapsed?: number;
};

export async function submitTestimony(input: TestimonyInput): Promise<{ ok: boolean; message: string }> {
  if (input.website) return { ok: true, message: "Merci pour votre proposition." };
  if ((input.elapsed ?? 99999) < 2500) return { ok: false, message: "Envoi trop rapide — veuillez patienter quelques secondes puis réessayer." };
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const body = input.body.trim();
  if (name.length < 2) return { ok: false, message: "Merci d'indiquer votre nom (il restera privé)." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Cette adresse e-mail ne semble pas valide." };
  if (body.length < 80) return { ok: false, message: "Décrivez votre parcours en quelques phrases (80 caractères minimum)." };
  if (!input.consent) return { ok: false, message: "Votre accord est nécessaire pour que la rédaction étudie votre proposition." };
  await db.insert(messages).values({
    kind: "temoignage", name, email, body,
    subject: "Proposition de témoignage",
    format: ["texte", "video", "audio"].includes(input.format) ? input.format : "texte",
    anonymous: input.anonymous, consent: true,
  });
  revalidatePath("/admin/messages");
  return {
    ok: true,
    message: "Merci pour votre confiance. Votre proposition reste strictement privée : un membre de la rédaction vous recontactera avant toute publication, et rien ne paraîtra sans votre accord explicite.",
  };
}