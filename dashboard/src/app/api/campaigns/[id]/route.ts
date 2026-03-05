import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      assets: {
        include: {
          versions: { orderBy: { version: "desc" }, take: 1 },
        },
      },
      adGroups: {
        include: {
          creatives: true,
        },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Resolve linked image/copy assets for each creative
  const allAssetIds = new Set<string>();
  for (const group of campaign.adGroups) {
    for (const creative of group.creatives) {
      if (creative.imageAssetId) allAssetIds.add(creative.imageAssetId);
      if (creative.copyAssetId) allAssetIds.add(creative.copyAssetId);
    }
  }

  const linkedAssets =
    allAssetIds.size > 0
      ? await prisma.asset.findMany({
          where: { id: { in: Array.from(allAssetIds) } },
          include: {
            versions: { orderBy: { version: "desc" }, take: 1 },
          },
        })
      : [];

  const assetMap = Object.fromEntries(linkedAssets.map((a) => [a.id, a]));

  // Enrich creatives with resolved asset data
  const enrichedAdGroups = campaign.adGroups.map((group) => ({
    ...group,
    creatives: group.creatives.map((creative) => ({
      ...creative,
      linkedImage: creative.imageAssetId
        ? assetMap[creative.imageAssetId] ?? null
        : null,
      linkedCopy: creative.copyAssetId
        ? assetMap[creative.copyAssetId] ?? null
        : null,
    })),
  }));

  return NextResponse.json({
    ...campaign,
    adGroups: enrichedAdGroups,
  });
}
