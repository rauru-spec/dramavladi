import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const seriesSchema = z.object({
  title: z.string().min(1).max(200),
  synopsis: z.string().min(1),
  coverUrl: z.string().url().optional().or(z.literal("")),
  genre: z.string().min(1),
  status: z.enum(["ONGOING", "COMPLETED", "COMING_SOON"]).default("ONGOING"),
  featured: z.boolean().default(false),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const series = await prisma.series.findMany({
    include: { _count: { select: { chapters: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(series);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = seriesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.series.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const series = await prisma.series.create({
    data: { ...parsed.data, slug, coverUrl: parsed.data.coverUrl || null },
  });

  return NextResponse.json(series, { status: 201 });
}
