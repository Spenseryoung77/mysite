import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAnyById } from "@/lib/queries";
import { ContentDetailView } from "@/components/ContentDetailView";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { STATUSES, type Status } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Aperçu", robots: { index: false } };

export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const data = await getAnyById(id);
  if (!data) notFound();
  return (
    <>
      <div className="bg-amber-400 px-4 py-2 text-center text-sm font-bold text-ink">
        Aperçu — statut : {STATUSES[data.c.status as Status] ?? data.c.status}. Cette page n’est pas publique.
      </div>
      <Header />
      <main id="contenu"><ContentDetailView data={data} relatedItems={[]} /></main>
      <Footer />
    </>
  );
}
