import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (campaignId) where.campaignId = campaignId;
  if (status) where.status = status;

  const optimizations = await prisma.optimizationDecision.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(optimizations);
}
