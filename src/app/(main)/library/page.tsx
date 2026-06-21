import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SeriesGrid } from "@/components/series/series-grid";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi Biblioteca" };

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [favorites, continueWatching] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { series: { include: { _count: { select: { chapters: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.watchProgress.findMany({
      where: { userId: session.user.id, completed: false },
      include: {
        chapter: {
          include: { series: { include: { _count: { select: { chapters: true } } } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const favoriteSeries = favorites.map((f: (typeof favorites)[0]) => f.series);

  const seenIds = new Set<string>();
  const continueSeries = continueWatching
    .filter((cw: (typeof continueWatching)[0]) => {
      if (seenIds.has(cw.chapter.series.id)) return false;
      seenIds.add(cw.chapter.series.id);
      return true;
    })
    .map((cw: (typeof continueWatching)[0]) => cw.chapter.series);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Mi Biblioteca</h1>

      {continueSeries.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--accent)]" /> Continuar viendo
          </h2>
          <SeriesGrid series={continueSeries} />
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--accent)]" /> Guardadas
        </h2>
        {favoriteSeries.length > 0 ? (
          <SeriesGrid series={favoriteSeries} />
        ) : (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Todavía no guardaste ninguna serie</p>
            <Link href="/search" className="text-[var(--accent)] text-sm mt-1 inline-block hover:underline">
              Explorar series
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
