import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    if (monthParam) {
      const [y, m] = monthParam.split("-").map(Number);
      year = y;
      month = m - 1;
    }

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const gridEnd = new Date(lastOfMonth);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));
    gridEnd.setHours(23, 59, 59, 999);

    const [calendarEvents, campaigns, assets] = await Promise.all([
      prisma.calendarEvent.findMany({
        where: {
          OR: [
            { date: { gte: gridStart, lte: gridEnd }, endDate: null },
            { date: { lte: gridEnd }, endDate: { gte: gridStart } },
          ],
        },
        orderBy: { date: "asc" },
      }),

      prisma.campaign.findMany({
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
          pillar: true,
        },
      }),

      prisma.asset.findMany({
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
      }),
    ]);

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

    for (const c of campaigns) {
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

    for (const a of assets) {
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

    return NextResponse.json({
      month: `${year}-${String(month + 1).padStart(2, "0")}`,
      gridStart: gridStart.toISOString(),
      gridEnd: gridEnd.toISOString(),
      events,
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
