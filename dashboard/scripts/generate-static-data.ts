/**
 * generate-static-data.ts — Pre-generates static JSON API responses for Vercel deployment.
 * Runs during build when SQLite is available, writes to public/_data/ so client components
 * can fetch pre-rendered data at runtime.
 *
 * Usage: npx tsx scripts/generate-static-data.ts
 * (run from dashboard/ directory)
 */

import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const dbPath = path.resolve(__dirname, "..", "prisma", "dev.db");
const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${dbPath}` },
  },
});
const outDir = path.join(__dirname, "..", "public", "_data");

function writeJSON(filePath: string, data: unknown) {
  const fullPath = path.join(outDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data));
}

async function main() {
  console.log("Generating static API data...");

  // Clean output dir
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // ── Individual asset pages ──
  const assets = await prisma.asset.findMany({
    include: {
      versions: {
        orderBy: { version: "desc" },
        include: {
          feedbacks: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      brandChecks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  for (const asset of assets) {
    writeJSON(`assets/${asset.id}.json`, asset);
  }

  console.log(`  Generated ${assets.length} asset data files`);

  // ── Individual campaign pages ──
  const campaigns = await prisma.campaign.findMany({
    include: {
      assets: {
        select: {
          id: true,
          type: true,
          title: true,
          status: true,
          platform: true,
          currentVersion: true,
        },
      },
      adGroups: {
        include: {
          creatives: true,
        },
      },
    },
  });

  for (const campaign of campaigns) {
    writeJSON(`campaigns/${campaign.id}.json`, campaign);
  }
  console.log(`  Generated ${campaigns.length} campaign data files`);

  // ── Calendar events ──
  for (let month = 1; month <= 12; month++) {
    const year = 2026;
    const firstOfMonth = new Date(year, month - 1, 1);
    const lastOfMonth = new Date(year, month, 0);

    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const gridEnd = new Date(lastOfMonth);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));
    gridEnd.setHours(23, 59, 59, 999);

    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        OR: [
          { date: { gte: gridStart, lte: gridEnd }, endDate: null },
          { date: { lte: gridEnd }, endDate: { gte: gridStart } },
        ],
      },
      orderBy: { date: "asc" },
    });

    const campaignsInRange = await prisma.campaign.findMany({
      where: {
        AND: [
          { startDate: { not: null } },
          {
            OR: [
              { startDate: { gte: gridStart, lte: gridEnd } },
              { endDate: { gte: gridStart, lte: gridEnd } },
              { startDate: { lte: gridStart }, endDate: { gte: gridEnd } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    const approvedAssets = await prisma.asset.findMany({
      where: {
        status: { in: ["APPROVED", "PUBLISHED"] },
        createdAt: { gte: gridStart, lte: gridEnd },
      },
      select: {
        id: true,
        title: true,
        type: true,
        platform: true,
        status: true,
        createdAt: true,
      },
    });

    type NormalizedEvent = {
      id: string;
      title: string;
      description: string | null;
      date: string;
      endDate: string | null;
      eventType: string;
      platform: string | null;
      status: string;
      source: "manual" | "campaign" | "asset";
      sourceId: string | null;
    };

    const events: NormalizedEvent[] = [];

    for (const e of calendarEvents) {
      events.push({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        eventType: e.eventType,
        platform: e.platform,
        status: e.status,
        source: "manual",
        sourceId: e.assetId ?? e.campaignId ?? null,
      });
    }

    for (const c of campaignsInRange) {
      events.push({
        id: `campaign-${c.id}`,
        title: c.name,
        description: null,
        date: c.startDate!.toISOString(),
        endDate: c.endDate?.toISOString() ?? null,
        eventType: "campaign_launch",
        platform: null,
        status: c.status,
        source: "campaign",
        sourceId: c.id,
      });
    }

    const assetTypeToEventType: Record<string, string> = {
      social_post: "social_post",
      copy: "content_publish",
      email: "email_send",
      ad_creative: "ad_start",
      image: "content_publish",
      video: "content_publish",
    };

    for (const a of approvedAssets) {
      events.push({
        id: `asset-${a.id}`,
        title: a.title,
        description: null,
        date: a.createdAt.toISOString(),
        endDate: null,
        eventType: assetTypeToEventType[a.type] ?? "milestone",
        platform: a.platform,
        status: a.status,
        source: "asset",
        sourceId: a.id,
      });
    }

    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    writeJSON(`calendar/events/${monthStr}.json`, {
      month: monthStr,
      gridStart: gridStart.toISOString(),
      gridEnd: gridEnd.toISOString(),
      events,
    });
  }
  console.log("  Generated calendar event data for all months");

  // ── Loops ──
  const loops = await prisma.loopExecution.findMany({
    include: {
      phases: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  writeJSON("loops.json", loops);

  for (const loop of loops) {
    const fullLoop = await prisma.loopExecution.findUnique({
      where: { id: loop.id },
      include: {
        phases: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    writeJSON(`loops/${loop.id}.json`, fullLoop);
  }
  console.log(`  Generated ${loops.length} loop data files`);

  // ── Metrics ──
  const metrics = await prisma.metricSnapshot.findMany({
    orderBy: { recordedAt: "desc" },
    take: 500,
  });
  writeJSON("metrics.json", metrics);
  console.log(`  Generated metrics data (${metrics.length} snapshots)`);

  // ── North Star ──
  const allCampaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      name: true,
      northStarTarget: true,
      northStarActual: true,
    },
  });
  const totalTarget = allCampaigns.reduce(
    (s: number, c: { northStarTarget: number | null }) => s + (c.northStarTarget ?? 0),
    0
  );
  const totalActual = allCampaigns.reduce(
    (s: number, c: { northStarActual: number | null }) => s + (c.northStarActual ?? 0),
    0
  );
  writeJSON("metrics/north-star.json", {
    totalTarget,
    totalActual,
    campaigns: allCampaigns.filter(
      (c: { northStarTarget: number | null }) => c.northStarTarget && c.northStarTarget > 0
    ),
    trend: [],
  });
  console.log("  Generated north star data");

  // ── Optimizations ──
  const optimizations = await prisma.optimizationDecision.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  writeJSON("optimizations.json", optimizations);
  console.log(`  Generated ${optimizations.length} optimization decisions`);

  // ── Research artifacts ──
  const researchArtifacts = await prisma.researchArtifact.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  writeJSON("research.json", researchArtifacts);
  console.log(`  Generated ${researchArtifacts.length} research artifacts`);

  // ── Command Center aggregated data ──
  const activeLoops = loops.filter((l: any) => l.status === "ACTIVE");
  const channelPerformance: Record<string, any> = {};

  const recentMetrics = await prisma.metricSnapshot.findMany({
    where: {
      recordedAt: { gte: new Date(Date.now() - 30 * 86400000) },
    },
  });

  for (const snap of recentMetrics) {
    if (!channelPerformance[snap.channel]) {
      channelPerformance[snap.channel] = {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cpa: 0,
      };
    }
    const ch = channelPerformance[snap.channel];
    switch (snap.metricType) {
      case "spend":
        ch.spend += snap.value;
        break;
      case "impressions":
        ch.impressions += snap.value;
        break;
      case "clicks":
        ch.clicks += snap.value;
        break;
      case "conversions":
        ch.conversions += snap.value;
        break;
      case "cpa":
        ch.cpa = snap.value;
        break;
    }
  }

  const assetStats = await prisma.asset.groupBy({
    by: ["status"],
    _count: true,
  });
  const statMap: Record<string, number> = {};
  for (const s of assetStats) {
    statMap[s.status] = s._count;
  }

  writeJSON("command-center.json", {
    northStar: {
      totalTarget,
      totalActual,
      campaigns: allCampaigns.filter(
        (c: { northStarTarget: number | null }) => c.northStarTarget && c.northStarTarget > 0
      ),
      trend: [],
    },
    activeLoops: activeLoops.map((l: any) => ({
      id: l.id,
      loopType: l.loopType,
      currentPhase: l.currentPhase,
      cycleNumber: l.cycleNumber,
      status: l.status,
      campaignId: l.campaignId,
      updatedAt: l.updatedAt,
    })),
    channelPerformance,
    recentOptimizations: optimizations.slice(0, 10),
    assetStats: {
      total: Object.values(statMap).reduce((s: number, v: number) => s + v, 0),
      inReview: statMap.IN_REVIEW ?? 0,
      approved: statMap.APPROVED ?? 0,
      published: statMap.PUBLISHED ?? 0,
      live: statMap.LIVE ?? 0,
    },
  });
  console.log("  Generated command center data");

  // ── Google Ads connection (static empty response) ──
  writeJSON("google-ads/connection.json", {
    connected: false,
    message: "Google Ads not available in deployed preview",
  });

  // ── Meta Ads connection (static empty response) ──
  writeJSON("meta-ads/connection.json", {
    connected: false,
    message: "Meta Ads not available in deployed preview",
  });

  // ── Social integrations (static empty response) ──
  writeJSON("social/integrations.json", {
    connected: false,
    integrations: [],
    error: "Postiz not available in deployed preview",
  });

  console.log("Done. Static data written to public/_data/");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
