import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [totalUsers, activeSubscribers, totalSeries, totalChapters, topChapters] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.series.count(),
    prisma.chapter.count(),
    prisma.chapterView.groupBy({
      by: ["chapterId"],
      _count: { chapterId: true },
      orderBy: { _count: { chapterId: "desc" } },
      take: 10,
    }),
  ]);

  const chapterIds = topChapters.map((c: (typeof topChapters)[0]) => c.chapterId);
  const chapters = await prisma.chapter.findMany({
    where: { id: { in: chapterIds } },
    include: { series: { select: { title: true } } },
  });

  const topChaptersWithInfo = topChapters.map((tc: (typeof topChapters)[0]) => {
    const ch = chapters.find((c: (typeof chapters)[0]) => c.id === tc.chapterId);
    return {
      chapterId: tc.chapterId,
      views: tc._count.chapterId,
      title: ch?.title ?? "—",
      seriesTitle: ch?.series.title ?? "—",
      chapterNumber: ch?.chapterNumber ?? 0,
    };
  });

  return NextResponse.json({
    totalUsers,
    activeSubscribers,
    totalSeries,
    totalChapters,
    topChapters: topChaptersWithInfo,
  });
}
