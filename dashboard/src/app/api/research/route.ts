import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const artifactType = searchParams.get("artifactType");

  const where: Record<string, unknown> = {};
  if (campaignId) where.campaignId = campaignId;
  if (artifactType) where.artifactType = artifactType;

  const artifacts = await prisma.researchArtifact.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(artifacts);
}
