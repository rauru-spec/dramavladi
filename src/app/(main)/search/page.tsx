import { prisma } from "@/lib/prisma";
import { SeriesGrid } from "@/components/series/series-grid";
import { Search } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string; genre?: string }>;
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Explorar" };

export default async function SearchPage({ searchParams }: Props) {
  const { q, genre } = await searchParams;

  const series = await prisma.series.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { synopsis: { contains: q, mode: "insensitive" } },
          ],
        } : {},
        genre ? { genre: { equals: genre, mode: "insensitive" } } : {},
      ],
    },
    include: { _count: { select: { chapters: true } } },
    orderBy: { publishedAt: "desc" },
  });

  const genres = await prisma.series.findMany({
    select: { genre: true },
    distinct: ["genre"],
    orderBy: { genre: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Explorar</h1>

        <form className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar series..."
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/search"
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            !genre ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
          }`}
        >
          Todos
        </a>
        {genres.map((g: { genre: string }) => (
          <a
            key={g.genre}
            href={`/search?genre=${encodeURIComponent(g.genre)}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              genre === g.genre ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            }`}
          >
            {g.genre}
          </a>
        ))}
      </div>

      {series.length > 0 ? (
        <SeriesGrid series={series} />
      ) : (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-base">No se encontraron series</p>
          {q && <p className="text-sm mt-1">intenta con otro término de búsqueda</p>}
        </div>
      )}
    </div>
  );
}
