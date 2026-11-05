import { notFound } from "next/navigation";
import { db } from "@/db";
import { contents, authors, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import Editor from "@/components/admin/editor";

export const dynamic = "force-dynamic";

export default async function EditorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "nouveau";
  const content = isNew ? null : (await db.select().from(contents).where(eq(contents.id, Number(id))).limit(1))[0];
  if (!isNew && !content) notFound();
  const [catsActu, catsFoi, authorList] = await Promise.all([
    getCategories("actualites"), getCategories("foi"), db.select().from(authors),
  ]);

  return (
    <Editor
      content={content ?? null}
      categories={[...catsActu, ...catsFoi]}
      authors={authorList}
      role={user.role}
      created={sp.created === "1"}
    />
  );
}