import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  synopsis: z.string().min(1).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  genre: z.string().min(1).optional(),
  status: z.enum(["ONGOING", "COMPLETED", "COMING_SOON"]).optional(),
  featured: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const series = await prisma.series.findUnique({
    where: { id },
    include: { chapters: { orderBy: { chapterNumber: "asc" } } },
  });
  if (!series) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(series);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const series = await prisma.series.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(series);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.series.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
