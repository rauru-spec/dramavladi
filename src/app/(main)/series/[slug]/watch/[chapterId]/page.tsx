import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { VideoPlayer } from "@/components/player/video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Lock, PlayCircle } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string; chapterId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterId } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { series: { select: { title: true } } },
  });
  if (!chapter) return { title: "Capítulo no encontrado" };
  return { title: `Cap. ${chapter.chapterNumber} — ${chapter.title} | ${chapter.series.title}` };
}

export default async function WatchPage({ params }: Props) {
  const { slug, chapterId } = await params;
  const session = await auth();

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { series: { include: { chapters: { orderBy: { chapterNumber: "asc" } } } } },
  });

  if (!chapter || chapter.series.slug !== slug) notFound();

  const chapters = chapter.series.chapters;
  const currentIndex = chapters.findIndex((c: typeof chapters[0]) => c.id === chapterId);
  const prev = chapters[currentIndex - 1] ?? null;
  const next = chapters[currentIndex + 1] ?? null;

  const isSubscribed = session?.user?.subscriptionStatus === "ACTIVE";

  const progress = session?.user
    ? await prisma.watchProgress.findUnique({
        where: { userId_chapterId: { userId: session.user.id, chapterId } },
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Link href={`/series/${slug}`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            {chapter.series.title}
          </Button>
        </Link>
      </div>

      <VideoPlayer
        chapterId={chapterId}
        isFree={chapter.isFree}
        initialTime={progress?.secondsWatched ?? 0}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--muted-foreground)] mb-1">
            Capítulo {chapter.chapterNumber}
          </p>
          <h1 className="text-xl font-bold">{chapter.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            {chapter.isFree ? (
              <Badge variant="success">Gratis</Badge>
            ) : (
              <Badge variant="muted" className="gap-1">
                <Lock className="h-3 w-3" /> Premium
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {prev && (
            <Link href={`/series/${slug}/watch/${prev.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Anterior
              </Button>
            </Link>
          )}
          {next && (
            <Link href={`/series/${slug}/watch/${next.id}`}>
              <Button size="sm" className="gap-1.5">
                Siguiente <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Más capítulos</h2>
        <div className="flex flex-col divide-y divide-[var(--border)]">
          {chapters.map((ch: typeof chapters[0]) => {
            const canWatch = ch.isFree || isSubscribed;
            const isCurrent = ch.id === chapterId;

            return (
              <div
                key={ch.id}
                className={`py-2.5 flex items-center gap-3 ${isCurrent ? "opacity-50" : ""}`}
              >
                <span className="text-sm text-[var(--muted-foreground)] w-8 shrink-0 text-right">
                  {ch.chapterNumber}
                </span>
                <span className="flex-1 text-sm truncate font-medium">{ch.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ch.isFree ? (
                    <Badge variant="success">Gratis</Badge>
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  )}
                  {isCurrent ? (
                    <Badge variant="accent">Viendo</Badge>
                  ) : canWatch ? (
                    <Link href={`/series/${slug}/watch/${ch.id}`}>
                      <Button size="sm" variant="ghost">
                        <PlayCircle className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/subscribe">
                      <Button size="sm" variant="ghost">
                        <Lock className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
