/**
 * generate-static-data.ts — Pre-generates static JSON API responses for Vercel deployment.
 * Runs during build when SQLite is available, writes to public/_data/ so client components
 * can fetch pre-rendered data at runtime.
 *
 * Usage: npx tsx scripts/generate-static-data.ts
 */

import path from "path";
import fs from "fs";

const dashboardPath = path.resolve(__dirname, "../dashboard");
const { PrismaClient } = require(
  path.join(dashboardPath, "node_modules/@prisma/client")
);

const dbPath = path.resolve(dashboardPath, "prisma/dev.db");
const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
});

const outDir = path.join(dashboardPath, "public", "_data");

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

    // Also write versions endpoint
    const versions = asset.versions.map((v: { id: string; version: number; filePath: string | null; content: string | null; changelog: string | null; metadata: string | null; createdAt: Date }) => ({
      id: v.id,
      version: v.version,
      filePath: v.filePath,
      content: v.content ? v.content.slice(0, 200) + "..." : null,
      changelog: v.changelog,
      metadata: v.metadata,
      createdAt: v.createdAt,
    }));
    writeJSON(`assets/${asset.id}/versions.json`, versions);

    // Scenes for video assets
    if (asset.type === "video") {
      const scenes = await prisma.videoScene.findMany({
        where: { assetId: asset.id },
        orderBy: { sceneNumber: "asc" },
      });
      writeJSON(`assets/${asset.id}/scenes.json`, scenes);
    }
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
  // Generate for months Jan 2026 through Apr 2026
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

  // ── Research briefs ──
  const researchBriefs = await prisma.researchBrief.findMany({
    orderBy: { createdAt: "desc" },
  });
  writeJSON("research-briefs.json", researchBriefs);
  console.log(`  Generated ${researchBriefs.length} research brief data files`);

  // ── Standups ──
  const standups = await prisma.standupSession.findMany({
    include: { items: { orderBy: { createdAt: "asc" } } },
    orderBy: { sessionDate: "desc" },
  });
  writeJSON("standups.json", standups);
  for (const s of standups) {
    writeJSON(`standups/${s.id}.json`, s);
  }
  console.log(`  Generated ${standups.length} standup data files`);

  // ── Progress logs ──
  const progressLogs = await prisma.progressLog.findMany({
    orderBy: { sessionDate: "desc" },
  });
  writeJSON("progress.json", progressLogs);
  console.log(`  Generated ${progressLogs.length} progress log data files`);

  // ── Event opportunities ──
  const events_opp = await prisma.eventOpportunity.findMany({
    orderBy: { startDate: "asc" },
  });
  writeJSON("event-opportunities.json", events_opp);
  console.log(`  Generated ${events_opp.length} event opportunity data files`);

  // ── Social integrations (static empty response) ──
  writeJSON("social/integrations.json", {
    connected: false,
    integrations: [],
    error: "Postiz not available in deployed preview",
  });

  console.log("Done. Static data written to dashboard/public/_data/");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
