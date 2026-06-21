import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FeaturedBanner } from "@/components/series/featured-banner";
import { SeriesGrid } from "@/components/series/series-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getData(userId?: string) {
  const [featured, allSeries, continueWatching] = await Promise.all([
    prisma.series.findFirst({
      where: { featured: true },
      include: { _count: { select: { chapters: true } } },
    }),
    prisma.series.findMany({
      include: { _count: { select: { chapters: true } } },
      orderBy: { publishedAt: "desc" },
    }),
    userId
      ? prisma.watchProgress.findMany({
          where: { userId, completed: false },
          include: {
            chapter: {
              include: { series: { include: { _count: { select: { chapters: true } } } } },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 6,
        })
      : Promise.resolve([]),
  ]);

  return { featured, allSeries, continueWatching };
}

export default async function HomePage() {
  const session = await auth();
  const { featured, allSeries, continueWatching } = await getData(session?.user?.id);

  type SeriesWithCount = (typeof allSeries)[0];
  const byGenre = allSeries.reduce<Record<string, SeriesWithCount[]>>((acc, s: SeriesWithCount) => {
    if (!acc[s.genre]) acc[s.genre] = [];
    acc[s.genre].push(s);
    return acc;
  }, {});

  const continueSeriesIds = new Set(continueWatching.map((cw: (typeof continueWatching)[0]) => cw.chapter.series.id));
  const continueSeries = [...continueSeriesIds].map((sid) => {
    const cw = continueWatching.find((c: (typeof continueWatching)[0]) => c.chapter.series.id === sid)!;
    return cw.chapter.series;
  });

  return (
    <div className="flex flex-col gap-10">
      {featured && (
        <FeaturedBanner
          title={featured.title}
          slug={featured.slug}
          synopsis={featured.synopsis}
          coverUrl={featured.coverUrl}
          genre={featured.genre}
          chapterCount={featured._count.chapters}
        />
      )}

      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Continuar viendo</h2>
            <Link href="/library">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todo <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <SeriesGrid series={continueSeries} />
        </section>
      )}

      {allSeries.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          <p className="text-lg">Pronto habrá contenido disponible.</p>
          <p className="text-sm mt-1">Vuelve más tarde.</p>
        </div>
      ) : (
        Object.entries(byGenre).map(([genre, series]) => (
          <section key={genre}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{genre}</h2>
              <Link href={`/search?genre=${encodeURIComponent(genre)}`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todo <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <SeriesGrid series={series} />
          </section>
        ))
      )}
    </div>
  );
}
