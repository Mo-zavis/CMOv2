import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  checkConnection,
  createCampaign,
  createAdSet,
  createAd,
  listCampaigns,
  listAdSets,
  getCampaignInsights,
  type DateRange,
} from "@/lib/meta-ads";

export async function POST(request: NextRequest) {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Meta Ads not connected" },
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
      // ----------------------------------------------------------------
      // PUSH: Read local campaign -> create on Meta Ads
      // ----------------------------------------------------------------
      case "push": {
        const campaign = await prisma.campaign.findUnique({
          where: { id: campaignId },
          include: {
            adGroups: {
              where: { platform: "meta_ads" },
              include: { creatives: true },
            },
          },
        });

        if (!campaign) {
          return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        const existing = campaign.metadata ? JSON.parse(campaign.metadata) : {};
        const syncLog: Array<{
          type: string;
          action: string;
          name?: string;
          id?: string;
        }> = [];

        // Create Meta campaign if not yet synced
        if (!existing.metaAds?.campaignId) {
          const metaCampaignId = await createCampaign({
            name: campaign.name,
            objective: "OUTCOME_LEADS",
            status: "PAUSED",
            specialAdCategories: [],
          });

          existing.metaAds = {
            campaignId: metaCampaignId,
            adSetIds: [],
            status: "PAUSED",
            syncedAt: new Date().toISOString(),
          };

          await prisma.campaign.update({
            where: { id: campaignId },
            data: { metadata: JSON.stringify(existing) },
          });

          syncLog.push({ type: "campaign", action: "created", id: metaCampaignId });
        } else {
          syncLog.push({ type: "campaign", action: "already_synced", id: existing.metaAds.campaignId });
        }

        const metaCampaignId: string = existing.metaAds.campaignId;

        // Create ad sets for each meta_ads ad group
        for (const adGroup of campaign.adGroups) {
          const agMeta = adGroup.metadata ? JSON.parse(adGroup.metadata) : {};

          if (agMeta.metaAds?.adSetId) {
            syncLog.push({ type: "ad_set", action: "already_synced", name: adGroup.name, id: agMeta.metaAds.adSetId });
            continue;
          }

          // Parse ad group targeting for geo / age overrides
          const agTargeting = adGroup.targeting ? JSON.parse(adGroup.targeting) : {};
          const metaTargeting: Record<string, unknown> = {
            geo_locations: agTargeting.locations
              ? { countries: agTargeting.locations }
              : { countries: ["US"] },
          };
          if (agTargeting.ageMin !== undefined) metaTargeting.age_min = agTargeting.ageMin;
          if (agTargeting.ageMax !== undefined) metaTargeting.age_max = agTargeting.ageMax;

          // Daily budget: use adGroup.budget / 30 or fallback to $10
          const dailyBudgetUsd = adGroup.budget ? adGroup.budget / 30 : 10;

          const adSetId = await createAdSet({
            name: adGroup.name,
            campaignId: metaCampaignId,
            dailyBudget: dailyBudgetUsd,
            optimizationGoal: "LEAD_GENERATION",
            bidStrategy: "LOWEST_COST_WITHOUT_CAP",
            targeting: metaTargeting as Parameters<typeof createAdSet>[0]["targeting"],
          });

          agMeta.metaAds = {
            adSetId,
            status: "PAUSED",
            syncedAt: new Date().toISOString(),
          };

          await prisma.adGroup.update({
            where: { id: adGroup.id },
            data: { metadata: JSON.stringify(agMeta) },
          });

          // Track adSetId in campaign metadata
          if (!existing.metaAds.adSetIds) existing.metaAds.adSetIds = [];
          existing.metaAds.adSetIds.push(adSetId);
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { metadata: JSON.stringify(existing) },
          });

          syncLog.push({ type: "ad_set", action: "created", name: adGroup.name, id: adSetId });

          // Push creatives as ads if a Facebook page ID is configured
          const pageId = process.env.META_PAGE_ID ?? "";

          for (const creative of adGroup.creatives) {
            // responsive_search format is Google-only; skip for Meta
            if (creative.format === "responsive_search") continue;

            const crMeta = creative.metadata ? JSON.parse(creative.metadata) : {};
            if (crMeta.metaAds?.adId) continue;

            if (!pageId) {
              syncLog.push({ type: "ad", action: "skipped_no_page_id", name: creative.headline });
              continue;
            }

            const adId = await createAd({
              name: creative.headline,
              adSetId,
              creative: {
                name: `${creative.headline} Creative`,
                pageId,
                title: creative.headline,
                body: creative.description ?? creative.headline,
                linkUrl: creative.landingUrl ?? "https://zavis.ai",
                callToAction: (creative.cta ?? "LEARN_MORE").toUpperCase().replace(/\s+/g, "_"),
              },
              status: "PAUSED",
            });

            crMeta.metaAds = {
              adId,
              syncedAt: new Date().toISOString(),
            };

            await prisma.adCreative.update({
              where: { id: creative.id },
              data: { metadata: JSON.stringify(crMeta) },
            });

            syncLog.push({ type: "ad", action: "created", name: creative.headline, id: adId });
          }
        }

        return NextResponse.json({ campaignId, syncLog });
      }

      // ----------------------------------------------------------------
      // PULL: Fetch current status from Meta -> update local DB
      // ----------------------------------------------------------------
      case "pull": {
        const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
          return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        const meta = campaign.metadata ? JSON.parse(campaign.metadata) : {};
        const metaCampaignId: string | undefined = meta.metaAds?.campaignId;

        if (!metaCampaignId) {
          return NextResponse.json({ error: "Campaign not synced to Meta Ads" }, { status: 400 });
        }

        const [allCampaigns, adSets] = await Promise.all([
          listCampaigns(),
          listAdSets(metaCampaignId),
        ]);

        const metaCampaign = allCampaigns.find((c) => c.id === metaCampaignId);
        if (metaCampaign) {
          meta.metaAds.status = metaCampaign.status;
          meta.metaAds.syncedAt = new Date().toISOString();

          await prisma.campaign.update({
            where: { id: campaignId },
            data: { metadata: JSON.stringify(meta) },
          });
        }

        return NextResponse.json({
          campaignId,
          metaCampaign: metaCampaign ?? null,
          adSets: adSets.length,
          synced: true,
        });
      }

      // ----------------------------------------------------------------
      // PULL-METRICS: Fetch last 30 days insights -> store MetricSnapshots
      // ----------------------------------------------------------------
      case "pull-metrics": {
        const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
          return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        const meta = campaign.metadata ? JSON.parse(campaign.metadata) : {};
        if (!meta.metaAds?.campaignId) {
          return NextResponse.json({ error: "Campaign not synced to Meta Ads" }, { status: 400 });
        }

        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateRange: DateRange = {
          start: thirtyDaysAgo.toISOString().slice(0, 10),
          end: today.toISOString().slice(0, 10),
        };

        const insights = await getCampaignInsights(meta.metaAds.campaignId, dateRange);

        // Persist insights in campaign metadata
        meta.metaAds.metrics = insights;
        meta.metaAds.lastMetricsPull = new Date().toISOString();

        await prisma.campaign.update({
          where: { id: campaignId },
          data: { metadata: JSON.stringify(meta) },
        });

        // Write individual MetricSnapshot rows
        const project = await prisma.project.findFirst();
        let snapshotsCreated = 0;

        if (project) {
          const snapshotData: Array<{ metricType: string; value: number }> = [
            { metricType: "impressions", value: insights.impressions },
            { metricType: "clicks", value: insights.clicks },
            { metricType: "ctr", value: insights.ctr },
            { metricType: "spend", value: insights.spend },
            { metricType: "conversions", value: insights.conversions },
            { metricType: "cpa", value: insights.costPerConversion },
            { metricType: "cpm", value: insights.cpm },
            { metricType: "reach", value: insights.reach },
          ];

          for (const snap of snapshotData) {
            await prisma.metricSnapshot.create({
              data: {
                projectId: project.id,
                campaignId,
                channel: "meta_ads",
                metricType: snap.metricType,
                value: snap.value,
                period: "monthly",
                metadata: JSON.stringify({ dateRange }),
              },
            });
          }

          snapshotsCreated = snapshotData.length;
        }

        return NextResponse.json({ campaignId, metrics: insights, snapshotsCreated });
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
