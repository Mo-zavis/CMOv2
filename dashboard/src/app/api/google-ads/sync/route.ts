import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  checkConnection,
  createCampaign,
  createAdGroup,
  addKeywords,
  listCampaigns,
  listAdGroups,
  getCampaignMetrics,
  type DateRange,
} from "@/lib/google-ads";
import { toMicros, fromMicros } from "@/lib/google-ads-types";

export async function POST(request: NextRequest) {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Google Ads not connected" },
        { status: 502 }
      );
    }

    const body = await request.json();
    const { action, campaignId } = body as { action: string; campaignId: string };

    if (!action || !campaignId) {
      return NextResponse.json(
        { error: "Required: action (push|pull|pull-metrics), campaignId" },
        { status: 400 }
      );
    }

    switch (action) {
      case "push": {
        const campaign = await prisma.campaign.findUnique({
          where: { id: campaignId },
          include: {
            adGroups: {
              where: { platform: "google_ads" },
              include: { creatives: true },
            },
          },
        });

        if (!campaign) {
          return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        const existing = campaign.metadata ? JSON.parse(campaign.metadata) : {};
        const syncLog: Array<{ type: string; action: string; name?: string; resourceName?: string }> = [];

        if (!existing.googleAds?.resourceName) {
          const bidStrategy = campaign.adGroups[0]?.bidStrategy?.toUpperCase() || "MAXIMIZE_CONVERSIONS";
          const resourceName = await createCampaign({
            name: campaign.name,
            budgetAmountUsd: campaign.budget || 100,
            advertisingChannelType: "SEARCH",
            biddingStrategy: bidStrategy as "MAXIMIZE_CONVERSIONS",
            startDate: campaign.startDate?.toISOString().slice(0, 10),
            endDate: campaign.endDate?.toISOString().slice(0, 10),
          });

          existing.googleAds = {
            resourceName,
            googleId: resourceName.split("/").pop(),
            status: "PAUSED",
            syncedAt: new Date().toISOString(),
          };

          await prisma.campaign.update({
            where: { id: campaignId },
            data: { metadata: JSON.stringify(existing) },
          });

          syncLog.push({ type: "campaign", action: "created", resourceName });
        }

        const campaignRN = existing.googleAds.resourceName;

        for (const adGroup of campaign.adGroups) {
          const agMeta = adGroup.metadata ? JSON.parse(adGroup.metadata) : {};
          if (agMeta.googleAds?.resourceName) {
            syncLog.push({ type: "ad_group", action: "already_synced", name: adGroup.name });
            continue;
          }

          const adType = adGroup.adType === "search" ? "SEARCH_STANDARD" : "DISPLAY_STANDARD";
          const agRN = await createAdGroup({
            campaignResourceName: campaignRN,
            name: adGroup.name,
            type: adType as "SEARCH_STANDARD",
            cpcBidMicros: adGroup.budget ? toMicros(adGroup.budget / 30) : undefined,
          });

          agMeta.googleAds = {
            resourceName: agRN,
            googleId: agRN.split("/").pop(),
            status: "ENABLED",
            syncedAt: new Date().toISOString(),
          };

          await prisma.adGroup.update({
            where: { id: adGroup.id },
            data: { metadata: JSON.stringify(agMeta) },
          });

          syncLog.push({ type: "ad_group", action: "created", name: adGroup.name, resourceName: agRN });

          // Push keywords
          if (adGroup.keywords) {
            const keywords = JSON.parse(adGroup.keywords) as Array<{ keyword: string; matchType: string; bid?: number }>;
            if (keywords.length > 0) {
              await addKeywords(
                agRN,
                keywords.map((kw) => ({
                  keyword: kw.keyword,
                  matchType: (kw.matchType || "PHRASE").toUpperCase() as "EXACT" | "PHRASE" | "BROAD",
                  bidMicros: kw.bid ? toMicros(kw.bid) : undefined,
                }))
              );
              syncLog.push({ type: "keywords", action: "added", name: `${keywords.length} keywords` });
            }
          }
        }

        return NextResponse.json({ campaignId, syncLog });
      }

      case "pull": {
        const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
          return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        const meta = campaign.metadata ? JSON.parse(campaign.metadata) : {};
        const googleId = meta.googleAds?.googleId;
        if (!googleId) {
          return NextResponse.json({ error: "Campaign not synced to Google Ads" }, { status: 400 });
        }

        const [campaigns, adGroups] = await Promise.all([
          listCampaigns(),
          listAdGroups(googleId),
        ]);

        const googleCampaign = campaigns.find((c) => c.id === googleId);
        if (googleCampaign) {
          meta.googleAds.status = googleCampaign.status;
          meta.googleAds.dailyBudgetUsd = googleCampaign.budget
            ? fromMicros(googleCampaign.budget.amountMicros)
            : null;
          meta.googleAds.syncedAt = new Date().toISOString();

          await prisma.campaign.update({
            where: { id: campaignId },
            data: { metadata: JSON.stringify(meta) },
          });
        }

        return NextResponse.json({
          campaignId,
          googleCampaign: googleCampaign || null,
          adGroups: adGroups.length,
          synced: true,
        });
      }

      case "pull-metrics": {
        const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
          return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        const meta = campaign.metadata ? JSON.parse(campaign.metadata) : {};
        if (!meta.googleAds?.googleId) {
          return NextResponse.json({ error: "Campaign not synced to Google Ads" }, { status: 400 });
        }

        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateRange: DateRange = {
          start: thirtyDaysAgo.toISOString().slice(0, 10),
          end: today.toISOString().slice(0, 10),
        };

        const metrics = await getCampaignMetrics(dateRange);
        const campaignMetrics = metrics.find((m) => m.campaignId === meta.googleAds.googleId);

        if (campaignMetrics) {
          meta.googleAds.metrics = { dateRange, ...campaignMetrics };
          meta.googleAds.lastMetricsPull = new Date().toISOString();

          await prisma.campaign.update({
            where: { id: campaignId },
            data: { metadata: JSON.stringify(meta) },
          });
        }

        return NextResponse.json({ campaignId, metrics: campaignMetrics || null });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Use push, pull, or pull-metrics` },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
