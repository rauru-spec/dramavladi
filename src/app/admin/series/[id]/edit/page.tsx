import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SeriesForm } from "@/components/admin/series-form";
import { ChaptersAdmin } from "@/components/admin/chapters-admin";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar serie — Admin" };

export default async function EditSeriesPage({ params }: Props) {
  const { id } = await params;
  const series = await prisma.series.findUnique({
    where: { id },
    include: { chapters: { orderBy: { chapterNumber: "asc" } } },
  });
  if (!series) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Editar serie</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{series.title}</p>
      </div>

      <SeriesForm
        mode="edit"
        initialData={{
          id: series.id,
          title: series.title,
          synopsis: series.synopsis,
          coverUrl: series.coverUrl ?? "",
          genre: series.genre,
          status: series.status,
          featured: series.featured,
        }}
      />

      <ChaptersAdmin seriesId={series.id} initialChapters={series.chapters} />
    </div>
  );
}
