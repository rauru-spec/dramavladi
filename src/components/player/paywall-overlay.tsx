"use client";

import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function PaywallOverlay() {
  const { data: session } = useSession();

  return (
    <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-[var(--card)] to-[var(--muted)] border border-[var(--border)] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="h-14 w-14 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center">
        <Lock className="h-6 w-6 text-[var(--accent)]" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">Contenido exclusivo</h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
          Suscríbete para acceder a todos los capítulos de pago por solo <strong>$3.99/mes</strong>.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Link href="/subscribe">
          <Button size="lg" className="w-full gap-2">
            <Crown className="h-4 w-4" />
            Ver planes
          </Button>
        </Link>
        {!session && (
          <Link href="/login">
            <Button variant="outline" size="sm" className="w-full">
              Ya tengo cuenta — Iniciar sesión
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
