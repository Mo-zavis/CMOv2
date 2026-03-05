import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const versions = await prisma.assetVersion.findMany({
    where: { assetId: id },
    orderBy: { version: "asc" },
    include: {
      feedbacks: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(versions);
}
