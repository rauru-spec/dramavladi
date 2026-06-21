import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Tv, Film } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

async function getMetrics() {
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

  const top = topChapters.map((tc: (typeof topChapters)[0]) => {
    const ch = chapters.find((c: (typeof chapters)[0]) => c.id === tc.chapterId);
    return {
      chapterId: tc.chapterId,
      views: tc._count.chapterId,
      title: ch?.title ?? "—",
      seriesTitle: ch?.series.title ?? "—",
      chapterNumber: ch?.chapterNumber ?? 0,
    };
  });

  return { totalUsers, activeSubscribers, totalSeries, totalChapters, top };
}

export default async function AdminDashboard() {
  const { totalUsers, activeSubscribers, totalSeries, totalChapters, top } = await getMetrics();

  const stats = [
    { label: "Usuarios registrados", value: totalUsers, icon: Users },
    { label: "Suscriptores activos", value: activeSubscribers, icon: Crown },
    { label: "Series", value: totalSeries, icon: Tv },
    { label: "Capítulos", value: totalChapters, icon: Film },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--muted-foreground)]">{s.label}</p>
                <s.icon className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-3xl font-bold">{s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capítulos más vistos</CardTitle>
        </CardHeader>
        <CardContent>
          {top.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">Sin datos todavía</p>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--border)]">
              {top.map((t: (typeof top)[0], i: number) => (
                <div key={t.chapterId} className="py-2.5 flex items-center gap-3">
                  <span className="text-sm text-[var(--muted-foreground)] w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.seriesTitle}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Cap. {t.chapterNumber} — {t.title}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--accent)] shrink-0">
                    {t.views.toLocaleString()} vistas
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
