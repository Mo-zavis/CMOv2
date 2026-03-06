import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const metricType = searchParams.get("metricType");
  const campaignId = searchParams.get("campaignId");
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const where: Record<string, unknown> = {
    recordedAt: { gte: since },
  };
  if (channel) where.channel = channel;
  if (metricType) where.metricType = metricType;
  if (campaignId) where.campaignId = campaignId;

  const metrics = await prisma.metricSnapshot.findMany({
    where,
    orderBy: { recordedAt: "desc" },
  });

  return NextResponse.json(metrics);
}
