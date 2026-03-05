import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const scenes = await prisma.videoScene.findMany({
    where: { assetId: id },
    orderBy: { sceneNumber: "asc" },
  });

  return NextResponse.json(scenes);
}
