"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Props {
  seriesId: string;
  initialFavorited: boolean;
}

export function FavoriteButton({ seriesId, initialFavorited }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
      toast(data.favorited ? "Añadida a tu biblioteca" : "Eliminada de tu biblioteca", "success");
    } catch {
      toast("Error al actualizar favoritos", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="lg" onClick={toggle} loading={loading} className="gap-2">
      <Heart className={favorited ? "h-5 w-5 fill-[var(--accent)] text-[var(--accent)]" : "h-5 w-5"} />
      {favorited ? "En tu biblioteca" : "Guardar"}
    </Button>
  );
}
