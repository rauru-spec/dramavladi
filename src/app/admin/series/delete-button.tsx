"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Props {
  id: string;
  title: string;
}

export function DeleteSeriesButton({ id, title }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/series/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      toast("Serie eliminada", "success");
      router.refresh();
    } else {
      toast("Error al eliminar", "error");
    }
  };

  return (
    <Button variant="ghost" size="sm" loading={loading} onClick={handleDelete} className="text-red-400 hover:text-red-300 gap-1.5">
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
