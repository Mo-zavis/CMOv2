import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const loopType = searchParams.get("loopType");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (campaignId) where.campaignId = campaignId;
  if (loopType) where.loopType = loopType;
  if (status) where.status = status;

  const loops = await prisma.loopExecution.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      phases: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  return NextResponse.json(loops);
}
