"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Crown, LogOut, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

const statusLabel: Record<string, { label: string; variant: "success" | "warning" | "muted" }> = {
  ACTIVE: { label: "Activa", variant: "success" },
  CANCELED: { label: "Cancelada", variant: "muted" },
  PAST_DUE: { label: "Pago pendiente", variant: "warning" },
  INCOMPLETE: { label: "Incompleta", variant: "warning" },
  NONE: { label: "Sin suscripci��n", variant: "muted" },
};

export default function AccountPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);

  const sub = session?.user?.subscriptionStatus ?? "NONE";
  const status = statusLabel[sub] ?? statusLabel.NONE;
  const isActive = sub === "ACTIVE";

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/subscriptions/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast("No hay suscripción activa para gestionar", "error");
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setPortalLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Mi cuenta</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm">
            <span className="text-[var(--muted-foreground)]">Nombre: </span>
            {session.user.name ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-[var(--muted-foreground)]">Correo: </span>
            {session.user.email}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-4 w-4" /> Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">Estado</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {isActive ? (
            <Button variant="outline" onClick={openPortal} loading={portalLoading} className="w-full gap-2">
              <CreditCard className="h-4 w-4" />
              Gestionar suscripción
            </Button>
          ) : (
            <Link href="/subscribe">
              <Button className="w-full gap-2">
                <Crown className="h-4 w-4" />
                Suscribirme — $3.99/mes
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full gap-2"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>
    </div>
  );
}
