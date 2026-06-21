import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const chapterSchema = z.object({
  seriesId: z.string(),
  chapterNumber: z.number().int().min(1),
  title: z.string().min(1).max(200),
  videoId: z.string().optional().or(z.literal("")),
  duration: z.number().int().min(0).optional(),
  isFree: z.boolean().default(false),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = chapterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const chapter = await prisma.chapter.create({
    data: { ...parsed.data, videoId: parsed.data.videoId || null },
  });

  return NextResponse.json(chapter, { status: 201 });
}
