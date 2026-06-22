import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedVideoUrl, getBunnyEmbedUrl, isBunnyConfigured } from "@/lib/bunny";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const chapterId = req.nextUrl.searchParams.get("chapterId");
  if (!chapterId) {
    return NextResponse.json({ error: "chapterId requerido" }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) {
    return NextResponse.json({ error: "Capítulo no encontrado" }, { status: 404 });
  }

  if (!chapter.isFree) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.subscriptionStatus !== "ACTIVE") {
      return NextResponse.json({ error: "Suscripción requerida" }, { status: 403 });
    }
  }

  if (!chapter.videoId) {
    return NextResponse.json({ error: "Video no disponible" }, { status: 404 });
  }

  if (!isBunnyConfigured()) {
    return NextResponse.json({ error: "Proveedor de video no configurado aún" }, { status: 503 });
  }

  // Track view
  await prisma.chapterView.create({ data: { chapterId } }).catch(() => {});

  const url = getSignedVideoUrl(chapter.videoId);

  return NextResponse.json({ url });
}
