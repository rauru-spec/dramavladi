"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Crown, Check, Zap, Lock, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const features = [
  { icon: Tv, text: "Acceso a todos los capítulos de pago" },
  { icon: Zap, text: "Nuevos capítulos cada semana" },
  { icon: Lock, text: "Sin anuncios, sin interrupciones" },
  { icon: Crown, text: "Soporte prioritario" },
];

export default function SubscribePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isActive = session?.user?.subscriptionStatus === "ACTIVE";

  const handleCheckout = async () => {
    if (!session) {
      router.push("/login?callbackUrl=/subscribe");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast("Error al iniciar el pago", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 flex flex-col gap-8 items-center">
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 mb-4">
          <Crown className="h-7 w-7 text-[var(--accent)]" />
        </div>
        <h1 className="text-3xl font-bold">Suscripción Premium</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Accede a todo el contenido de Pasmiño Drama sin límites
        </p>
      </div>

      <Card className="w-full border-[var(--accent)]/50">
        <CardContent className="pt-6 flex flex-col gap-5">
          <div className="text-center">
            <div className="flex items-end justify-center gap-1">
              <span className="text-4xl font-bold">$3.99</span>
              <span className="text-[var(--muted-foreground)] mb-1">/mes</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Cancela cuando quieras</p>
          </div>

          <div className="flex flex-col gap-3">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                </div>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          {isActive ? (
            <div className="bg-green-900/30 border border-green-700/40 rounded-lg p-3 text-center">
              <p className="text-green-400 text-sm font-medium">✓ Ya tienes una suscripción activa</p>
            </div>
          ) : (
            <Button size="lg" className="w-full gap-2" onClick={handleCheckout} loading={loading}>
              <Crown className="h-4 w-4" />
              {session ? "Suscribirse ahora" : "Empezar — Inicia sesión primero"}
            </Button>
          )}

          <p className="text-xs text-[var(--muted-foreground)] text-center">
            Pago seguro mediante Stripe. Cancela en cualquier momento desde tu cuenta.
          </p>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          Los primeros 3 capítulos de cada serie son siempre gratuitos.
        </p>
      </div>
    </div>
  );
}
