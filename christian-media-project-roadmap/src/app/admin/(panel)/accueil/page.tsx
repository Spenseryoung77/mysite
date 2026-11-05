import { requireUser } from "@/lib/auth";
import { getPublished, getSetting, getHomeSections } from "@/lib/data";
import { AdminHead } from "@/components/admin/ui";
import HomeSettings from "@/components/admin/home-settings";

export const dynamic = "force-dynamic";

export default async function HomeAdminPage() {
  await requireUser(["admin", "editor"]);
  const [articles, temoignages, featuredId, testimonyId, sections] = await Promise.all([
    getPublished("article", { limit: 40 }),
    getPublished("temoignage", { limit: 40 }),
    getSetting("featured_id"),
    getSetting("featured_testimony_id"),
    getHomeSections(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminHead title="Accueil du site" sub="Choisissez la une, le témoignage mis en avant, et les sections affichées (ordre et visibilité). Les sections vides peuvent être masquées." />
      <HomeSettings
        articles={articles.items.map((a) => ({ id: a.id, title: a.title }))}
        testimonies={temoignages.items.map((t) => ({ id: t.id, title: t.title }))}
        featuredId={featuredId ? Number(featuredId) : null}
        testimonyId={testimonyId ? Number(testimonyId) : null}
        sections={sections}
      />
    </div>
  );
}