import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Film } from "lucide-react";
import { DeleteSeriesButton } from "./delete-button";

export const metadata = { title: "Series — Admin" };

const statusLabel: Record<string, string> = {
  ONGOING: "En emisión",
  COMPLETED: "Finalizada",
  COMING_SOON: "Próximamente",
};

export default async function AdminSeriesPage() {
  const series = await prisma.series.findMany({
    include: { _count: { select: { chapters: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Series</h1>
        <Link href="/admin/series/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Nueva serie
          </Button>
        </Link>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <Film className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Todavía no hay series</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {series.map((s: (typeof series)[0]) => (
            <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="relative h-16 w-12 shrink-0 rounded-lg overflow-hidden bg-[var(--muted)]">
                {s.coverUrl ? (
                  <Image src={s.coverUrl} alt={s.title} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="h-5 w-5 opacity-30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{s.title}</p>
                  {s.featured && <Badge variant="accent">Destacada</Badge>}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {s.genre} · {statusLabel[s.status]} · {s._count.chapters} cap.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/series/${s.id}/edit`}>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                </Link>
                <DeleteSeriesButton id={s.id} title={s.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
