import Link from "next/link";
import Image from "next/image";
import { Lock, PlayCircle, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SeriesCardProps {
  id: string;
  title: string;
  slug: string;
  coverUrl?: string | null;
  genre: string;
  status: string;
  chapterCount: number;
  featured?: boolean;
  hasNewChapter?: boolean;
  className?: string;
}

const statusLabel: Record<string, string> = {
  ONGOING: "En emisión",
  COMPLETED: "Finalizada",
  COMING_SOON: "Próximamente",
};

export function SeriesCard({
  title,
  slug,
  coverUrl,
  genre,
  status,
  chapterCount,
  featured,
  hasNewChapter,
  className,
}: SeriesCardProps) {
  return (
    <Link
      href={`/series/${slug}`}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] transition-transform duration-200 hover:scale-[1.02] hover:border-[var(--accent)]/50",
        className
      )}
    >
      <div className="relative aspect-[2/3] w-full bg-[var(--muted)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-opacity group-hover:opacity-90"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="h-10 w-10 text-[var(--muted-foreground)] opacity-40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {featured && (
          <div className="absolute top-2 left-2">
            <Badge variant="accent" className="gap-1">
              <Flame className="h-3 w-3" /> Destacada
            </Badge>
          </div>
        )}
        {hasNewChapter && !featured && (
          <div className="absolute top-2 left-2">
            <Badge variant="accent">Nuevo</Badge>
          </div>
        )}

        <div className="absolute bottom-2 right-2">
          <span className="text-xs text-white/80 bg-black/50 rounded px-1.5 py-0.5">
            {chapterCount} cap.
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-[var(--muted-foreground)]">{genre}</p>
        <h3 className="text-sm font-semibold line-clamp-2 leading-tight">{title}</h3>
        <p className="text-xs text-[var(--muted-foreground)]">{statusLabel[status] ?? status}</p>
      </div>
    </Link>
  );
}
