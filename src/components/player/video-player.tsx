"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PaywallOverlay } from "./paywall-overlay";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  chapterId: string;
  isFree: boolean;
  onEnded?: () => void;
  onProgress?: (seconds: number) => void;
  initialTime?: number;
}

export function VideoPlayer({ chapterId, isFree, onEnded, onProgress, initialTime = 0 }: VideoPlayerProps) {
  const { data: session } = useSession();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  const isSubscribed = session?.user?.subscriptionStatus === "ACTIVE";
  const canWatch = isFree || isSubscribed;

  useEffect(() => {
    if (!canWatch) {
      setNeedsSubscription(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/video/signed-url?chapterId=${chapterId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          if (data.error === "Suscripción requerida") {
            setNeedsSubscription(true);
          } else {
            setError(data.error);
          }
        } else {
          setEmbedUrl(data.url);
        }
      })
      .catch(() => setError("No se pudo cargar el video"))
      .finally(() => setLoading(false));
  }, [chapterId, canWatch]);

  const saveProgress = useCallback(
    async (seconds: number, completed = false) => {
      if (!session?.user) return;
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, secondsWatched: seconds, completed }),
      }).catch(() => {});
      onProgress?.(seconds);
    },
    [chapterId, session, onProgress]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (embedUrl) saveProgress(Math.floor(Date.now() / 1000));
    }, 30000);
    return () => clearInterval(interval);
  }, [embedUrl, saveProgress]);

  if (needsSubscription) {
    return <PaywallOverlay />;
  }

  if (loading) {
    return (
      <div className="aspect-video w-full rounded-xl bg-[var(--muted)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (error) {
    const isComingSoon = error.includes("no configurado") || error.includes("no disponible");
    return (
      <div className="aspect-video w-full rounded-xl bg-[var(--muted)] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-2xl">{isComingSoon ? "🎬" : "⚠️"}</p>
        <p className="text-[var(--foreground)] text-sm font-medium">
          {isComingSoon ? "Video próximamente" : "No se pudo cargar el video"}
        </p>
        <p className="text-[var(--muted-foreground)] text-xs max-w-xs">
          {isComingSoon
            ? "Este capítulo estará disponible muy pronto."
            : error}
        </p>
      </div>
    );
  }

  if (!embedUrl) return null;

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen"
        title="Video player"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
