import { SeriesForm } from "@/components/admin/series-form";

export const metadata = { title: "Nueva serie — Admin" };

export default function NewSeriesPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Nueva serie</h1>
      <SeriesForm mode="create" />
    </div>
  );
}
