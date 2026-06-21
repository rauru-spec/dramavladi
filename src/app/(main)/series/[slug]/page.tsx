import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, PlayCircle, CheckCircle2, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Metadata } from "next";
import { FavoriteButton } from "./favorite-button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await prisma.series.findUnique({ where: { slug } });
  if (!series) return { title: "No encontrado" };
  return {
    title: series.title,
    description: series.synopsis.slice(0, 160),
    openGraph: { images: series.coverUrl ? [series.coverUrl] : [] },
  };
}

const statusLabel: Record<string, string> = {
  ONGOING: "En emisión",
  COMPLETED: "Finalizada",
  COMING_SOON: "Próximamente",
};

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const [series, progress] = await Promise.all([
    prisma.series.findUnique({
      where: { slug },
      include: { chapters: { orderBy: { chapterNumber: "asc" } } },
    }),
    session?.user
      ? prisma.watchProgress.findMany({
          where: { userId: session.user.id },
          select: { chapterId: true, completed: true, secondsWatched: true },
        })
      : Promise.resolve([]),
  ]);

  if (!series) notFound();

  type ProgressEntry = { chapterId: string; completed: boolean; secondsWatched: number };
  const progressMap = new Map<string, ProgressEntry>(
    (progress as ProgressEntry[]).map((p) => [p.chapterId, p])
  );
  const isSubscribed = session?.user?.subscriptionStatus === "ACTIVE";

  const isFavorited = session?.user
    ? !!(await prisma.favorite.findUnique({
        where: { userId_seriesId: { userId: session.user.id, seriesId: series.id } },
      }))
    : false;

  const firstChapter = series.chapters[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative w-full md:w-48 shrink-0 aspect-[2/3] md:aspect-auto md:h-72 rounded-xl overflow-hidden bg-[var(--muted)]">
          {series.coverUrl ? (
            <Image src={series.coverUrl} alt={series.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-[var(--muted-foreground)] opacity-30" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="muted">{series.genre}</Badge>
            <Badge variant={series.status === "ONGOING" ? "success" : "muted"}>
              {statusLabel[series.status]}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{series.title}</h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3 md:line-clamp-none">
            {series.synopsis}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {series.chapters.length} capítulos ·{" "}
            {series.chapters.filter((c) => c.isFree).length} gratuitos
          </p>

          <div className="flex items-center gap-3 mt-auto pt-2">
            {firstChapter && (
              <Link href={`/series/${slug}/watch/${firstChapter.id}`}>
                <Button size="lg" className="gap-2">
                  <PlayCircle className="h-5 w-5" />
                  {progressMap.has(firstChapter.id) ? "Continuar" : "Ver ahora"}
                </Button>
              </Link>
            )}
            {session?.user && (
              <FavoriteButton seriesId={series.id} initialFavorited={isFavorited} />
            )}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Capítulos</h2>
      <div className="flex flex-col divide-y divide-[var(--border)]">
        {series.chapters.map((chapter) => {
          const prog = progressMap.get(chapter.id);
          const canWatch = chapter.isFree || isSubscribed;

          return (
            <div key={chapter.id} className="py-3 flex items-center gap-3">
              <span className="text-sm text-[var(--muted-foreground)] w-8 shrink-0 text-right">
                {chapter.chapterNumber}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{chapter.title}</p>
                {chapter.duration && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatDuration(chapter.duration)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {chapter.isFree ? (
                  <Badge variant="success">Gratis</Badge>
                ) : (
                  <Badge variant="muted" className="gap-1">
                    <Lock className="h-3 w-3" /> Premium
                  </Badge>
                )}

                {prog?.completed && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}

                {canWatch ? (
                  <Link href={`/series/${slug}/watch/${chapter.id}`}>
                    <Button size="sm" variant="ghost" className="gap-1.5">
                      <PlayCircle className="h-3.5 w-3.5" />
                      Ver
                    </Button>
                  </Link>
                ) : (
                  <Link href="/subscribe">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      Suscríbete
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
