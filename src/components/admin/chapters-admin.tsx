"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Lock, Unlock, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  videoId: string | null;
  duration: number | null;
  isFree: boolean;
}

interface Props {
  seriesId: string;
  initialChapters: Chapter[];
}

type FormData = {
  chapterNumber: string;
  title: string;
  videoId: string;
  duration: string;
  isFree: boolean;
};

export function ChaptersAdmin({ seriesId, initialChapters }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      chapterNumber: String(chapters.length + 1),
      title: "",
      videoId: "",
      duration: "",
      isFree: chapters.length < 3,
    },
  });

  const onAdd = async (raw: FormData) => {
    if (!raw.title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesId,
        chapterNumber: parseInt(raw.chapterNumber, 10),
        title: raw.title.trim(),
        videoId: raw.videoId || undefined,
        duration: raw.duration ? parseInt(raw.duration, 10) : undefined,
        isFree: raw.isFree,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const chapter = await res.json();
      setChapters((prev) => [...prev, chapter]);
      reset({ chapterNumber: String(chapters.length + 2), isFree: chapters.length + 1 < 3 });
      setAdding(false);
      toast("Capítulo añadido", "success");
      router.refresh();
    } else {
      const json = await res.json();
      toast(json.error ?? "Error al añadir", "error");
    }
  };

  const deleteChapter = async (id: string) => {
    if (!confirm("¿Eliminar este capítulo?")) return;
    const res = await fetch(`/api/admin/chapters/${id}`, { method: "DELETE" });
    if (res.ok) {
      setChapters((prev) => prev.filter((c) => c.id !== id));
      toast("Capítulo eliminado", "success");
    } else {
      toast("Error al eliminar", "error");
    }
  };

  const toggleFree = async (chapter: Chapter) => {
    const res = await fetch(`/api/admin/chapters/${chapter.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFree: !chapter.isFree }),
    });
    if (res.ok) {
      setChapters((prev) => prev.map((c) => c.id === chapter.id ? { ...c, isFree: !c.isFree } : c));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Capítulos ({chapters.length})</h2>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Añadir capítulo
          </Button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleSubmit(onAdd)} className="border border-[var(--accent)]/30 rounded-xl p-4 flex flex-col gap-3 bg-[var(--card)]">
          <h3 className="text-sm font-semibold">Nuevo capítulo</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Número" type="number" error={errors.chapterNumber?.message} {...register("chapterNumber")} />
            <Input label="Duración (seg)" type="number" placeholder="Opcional" {...register("duration")} />
          </div>
          <Input label="Título" placeholder="Título del capítulo" error={errors.title?.message} {...register("title")} />
          <Input
            label="Video ID (Bunny Stream)"
            placeholder="Pega el ID del video de Bunny Stream"
            {...register("videoId")}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded accent-[var(--accent)]" {...register("isFree")} />
            <span className="text-sm">Capítulo gratuito</span>
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={saving} size="sm">Guardar</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setAdding(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      <div className="flex flex-col divide-y divide-[var(--border)]">
        {chapters.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">No hay capítulos todavía</p>
        )}
        {chapters.map((ch) => (
          <div key={ch.id} className="py-3 flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-[var(--muted-foreground)] opacity-40 shrink-0" />
            <span className="text-sm text-[var(--muted-foreground)] w-8 text-right shrink-0">{ch.chapterNumber}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ch.title}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">
                {ch.videoId ? `ID: ${ch.videoId}` : "Sin video"}
              </p>
            </div>
            <Badge variant={ch.isFree ? "success" : "muted"}>{ch.isFree ? "Gratis" : "Premium"}</Badge>
            <Button variant="ghost" size="icon" onClick={() => toggleFree(ch)} title="Cambiar acceso">
              {ch.isFree ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteChapter(ch.id)} className="text-red-400 hover:text-red-300">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
