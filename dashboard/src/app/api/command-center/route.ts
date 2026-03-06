import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [
    campaigns,
    northStarTrendSnapshots,
    activeLoops,
    channelSnapshots,
    recentOptimizations,
    assetCounts,
  ] = await Promise.all([
    // All campaigns for north star aggregation
    prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        northStarTarget: true,
        northStarActual: true,
      },
      orderBy: { createdAt: "asc" },
    }),

    // North star trend: demo_bookings from overall channel, last 30 days
    prisma.metricSnapshot.findMany({
      where: {
        metricType: "demo_bookings",
        channel: "overall",
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: "asc" },
    }),

    // Active loop executions with latest 3 phase logs
    prisma.loopExecution.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      include: {
        phases: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    }),

    // Channel performance: all metric snapshots in last 30 days (non-overall)
    prisma.metricSnapshot.findMany({
      where: {
        recordedAt: { gte: since },
      },
      select: {
        channel: true,
        metricType: true,
        value: true,
      },
    }),

    // Recent optimization decisions, last 10
    prisma.optimizationDecision.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Asset status counts
    prisma.asset.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  // --- North Star ---
  const totalTarget = campaigns.reduce(
    (sum, c) => sum + (c.northStarTarget ?? 0),
    0
  );
  const totalActual = campaigns.reduce(
    (sum, c) => sum + (c.northStarActual ?? 0),
    0
  );

  const trendByDate: Record<string, number> = {};
  for (const snapshot of northStarTrendSnapshots) {
    const date = snapshot.recordedAt.toISOString().slice(0, 10);
    trendByDate[date] = (trendByDate[date] ?? 0) + snapshot.value;
  }
  const trend = Object.entries(trendByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  // --- Active Loops: resolve campaign names ---
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.name]));

  // Fetch any campaign IDs referenced by loops that aren't already in the map
  const loopCampaignIds = activeLoops
    .map((l) => l.campaignId)
    .filter((cid): cid is string => cid != null && !campaignMap.has(cid));

  if (loopCampaignIds.length > 0) {
    const extraCampaigns = await prisma.campaign.findMany({
      where: { id: { in: loopCampaignIds } },
      select: { id: true, name: true },
    });
    for (const c of extraCampaigns) {
      campaignMap.set(c.id, c.name);
    }
  }

  const activeLoopsWithName = activeLoops.map((loop) => ({
    id: loop.id,
    loopType: loop.loopType,
    currentPhase: loop.currentPhase,
    cycleNumber: loop.cycleNumber,
    status: loop.status,
    campaignId: loop.campaignId,
    campaignName: loop.campaignId ? (campaignMap.get(loop.campaignId) ?? null) : null,
    updatedAt: loop.updatedAt,
    phases: loop.phases,
  }));

  // --- Channel Performance ---
  // Aggregate by channel: sum spend, impressions, clicks, conversions; derive cpa
  type ChannelAgg = {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
  const channelAgg: Record<string, ChannelAgg> = {};

  for (const s of channelSnapshots) {
    if (!channelAgg[s.channel]) {
      channelAgg[s.channel] = {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };
    }
    const agg = channelAgg[s.channel];
    if (s.metricType === "spend") agg.spend += s.value;
    else if (s.metricType === "impressions") agg.impressions += s.value;
    else if (s.metricType === "clicks") agg.clicks += s.value;
    else if (s.metricType === "conversions") agg.conversions += s.value;
  }

  const channelPerformance: Record<
    string,
    {
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
      cpa: number;
    }
  > = {};

  for (const [channel, agg] of Object.entries(channelAgg)) {
    channelPerformance[channel] = {
      ...agg,
      cpa: agg.conversions > 0 ? agg.spend / agg.conversions : 0,
    };
  }

  // --- Asset Stats ---
  const assetStats = {
    total: 0,
    inReview: 0,
    approved: 0,
    published: 0,
    live: 0,
  };
  for (const group of assetCounts) {
    assetStats.total += group._count.id;
    if (group.status === "IN_REVIEW") assetStats.inReview += group._count.id;
    else if (group.status === "APPROVED") assetStats.approved += group._count.id;
    else if (group.status === "PUBLISHED") assetStats.published += group._count.id;
    else if (group.status === "LIVE") assetStats.live += group._count.id;
  }

  return NextResponse.json({
    northStar: {
      totalTarget,
      totalActual,
      campaigns: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        target: c.northStarTarget ?? 0,
        actual: c.northStarActual ?? 0,
      })),
      trend,
    },
    activeLoops: activeLoopsWithName,
    channelPerformance,
    recentOptimizations,
    assetStats,
  });
}
