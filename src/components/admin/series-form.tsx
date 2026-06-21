"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  title: z.string().min(1, "Requerido"),
  synopsis: z.string().min(1, "Requerido"),
  coverUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  genre: z.string().min(1, "Requerido"),
  status: z.enum(["ONGOING", "COMPLETED", "COMING_SOON"]),
  featured: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialData?: Partial<FormData> & { id?: string };
  mode: "create" | "edit";
}

const statusOptions = [
  { value: "ONGOING", label: "En emisión" },
  { value: "COMPLETED", label: "Finalizada" },
  { value: "COMING_SOON", label: "Próximamente" },
];

export function SeriesForm({ initialData, mode }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      synopsis: initialData?.synopsis ?? "",
      coverUrl: initialData?.coverUrl ?? "",
      genre: initialData?.genre ?? "",
      status: (initialData?.status as FormData["status"]) ?? "ONGOING",
      featured: initialData?.featured ?? false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const url = mode === "edit" ? `/api/admin/series/${initialData?.id}` : "/api/admin/series";
    const method = mode === "edit" ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) {
      toast(mode === "create" ? "Serie creada" : "Serie actualizada", "success");
      router.push("/admin/series");
      router.refresh();
    } else {
      const json = await res.json();
      toast(json.error ?? "Error al guardar", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
      <Input label="Título" placeholder="Nombre de la serie" error={errors.title?.message} {...register("title")} />
      <Textarea label="Sinopsis" placeholder="Descripción de la serie..." rows={4} error={errors.synopsis?.message} {...register("synopsis")} />
      <Input label="URL de portada" placeholder="https://..." error={errors.coverUrl?.message} {...register("coverUrl")} />
      <Input label="Género / Categoría" placeholder="Drama, Romance, Familiar..." error={errors.genre?.message} {...register("genre")} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Estado</label>
        <select
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          {...register("status")}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" className="h-4 w-4 rounded accent-[var(--accent)]" {...register("featured")} />
        <span className="text-sm">Marcar como destacada en el home</span>
      </label>

      <div className="flex gap-3 mt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {mode === "create" ? "Crear serie" : "Guardar cambios"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
