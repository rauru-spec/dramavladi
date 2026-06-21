import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FeaturedBannerProps {
  title: string;
  slug: string;
  synopsis: string;
  coverUrl?: string | null;
  genre: string;
  chapterCount: number;
}

export function FeaturedBanner({ title, slug, synopsis, coverUrl, genre, chapterCount }: FeaturedBannerProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl min-h-[320px] md:min-h-[420px] flex items-end">
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/30 to-[var(--muted)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

      <div className="relative z-10 p-5 md:p-8 flex flex-col gap-3 w-full max-w-2xl">
        <div className="flex items-center gap-2">
          <Badge variant="accent">Destacada</Badge>
          <span className="text-xs text-white/70">{genre}</span>
          <span className="text-xs text-white/70">· {chapterCount} capítulos</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{title}</h1>
        <p className="text-sm text-white/80 line-clamp-2 max-w-lg">{synopsis}</p>
        <Link href={`/series/${slug}`}>
          <Button size="lg" className="w-fit gap-2 mt-1">
            <PlayCircle className="h-5 w-5" />
            Ver ahora
          </Button>
        </Link>
      </div>
    </div>
  );
}
