import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const campaignId = searchParams.get("campaignId");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (campaignId) where.campaignId = campaignId;

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
      brandChecks: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { feedbacks: true, versions: true } },
    },
  });

  return NextResponse.json(assets);
}
