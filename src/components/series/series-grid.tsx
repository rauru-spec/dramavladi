import { SeriesCard } from "./series-card";

interface Series {
  id: string;
  title: string;
  slug: string;
  coverUrl?: string | null;
  genre: string;
  status: string;
  featured: boolean;
  _count?: { chapters: number };
  chapters?: { id: string }[];
}

interface SeriesGridProps {
  series: Series[];
  title?: string;
}

export function SeriesGrid({ series, title }: SeriesGridProps) {
  if (series.length === 0) return null;

  return (
    <section>
      {title && (
        <h2 className="text-xl font-bold mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {series.map((s) => (
          <SeriesCard
            key={s.id}
            id={s.id}
            title={s.title}
            slug={s.slug}
            coverUrl={s.coverUrl}
            genre={s.genre}
            status={s.status}
            chapterCount={s._count?.chapters ?? s.chapters?.length ?? 0}
            featured={s.featured}
          />
        ))}
      </div>
    </section>
  );
}
