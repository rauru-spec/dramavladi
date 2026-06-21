import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  chapterId: z.string(),
  secondsWatched: z.number().int().min(0),
  completed: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { chapterId, secondsWatched, completed } = parsed.data;

  await prisma.watchProgress.upsert({
    where: { userId_chapterId: { userId: session.user.id, chapterId } },
    create: { userId: session.user.id, chapterId, secondsWatched, completed: completed ?? false },
    update: { secondsWatched, ...(completed !== undefined && { completed }) },
  });

  return NextResponse.json({ ok: true });
}
