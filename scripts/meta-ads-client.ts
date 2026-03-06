/**
 * meta-ads-client.ts -- CLI utility for the CMO agent (runtime) to interact with Meta Ads.
 *
 * Usage:
 *   npx tsx scripts/meta-ads-client.ts <command> [flags]
 *
 * Connection:
 *   check-connection                          Test API connectivity
 *   account-info                              Show ad account details
 *
 * Campaign Management:
 *   list-campaigns                            List all campaigns
 *   create-campaign --name --objective        Create a new campaign (PAUSED)
 *     [--status PAUSED|ACTIVE]
 *   update-campaign-status                    Enable/pause/delete a campaign
 *     --campaignId --status
 *
 * Ad Set Management:
 *   list-adsets --campaignId <id>             List ad sets for a campaign
 *   create-adset                              Create ad set
 *     --campaignId --name --dailyBudget
 *     [--targeting <json>]
 *
 * Ad Creation:
 *   create-ad                                 Create an ad
 *     --adSetId --name --body --linkUrl
 *     --callToAction [--pageId] [--imageHash] [--title]
 *
 * Reporting:
 *   campaign-performance --campaignId --startDate --endDate
 *   account-performance  --startDate --endDate
 *
 * Sync:
 *   sync-push --campaignId <localId>          Push local campaign to Meta Ads
 *   sync-pull --campaignId <localId>          Pull current status from Meta into local DB
 *   pull-metrics --campaignId <localId>       Pull last 30 days insights into MetricSnapshot
 */

import path from "path";
import fs from "fs";

// --- Environment ---

const envPath = path.resolve(__dirname, "../dashboard/.env");
const envContent = fs.readFileSync(envPath, "utf-8");

function envVar(name: string): string {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]*)"?`, "m"));
  return match?.[1] ?? "";
}

const ACCESS_TOKEN = envVar("META_ACCESS_TOKEN");
const AD_ACCOUNT_ID = envVar("META_AD_ACCOUNT_ID");

const API_BASE = "https://graph.facebook.com/v21.0";

// --- Prisma (for sync commands) ---

const prismaClientPath = path.resolve(__dirname, "../dashboard/node_modules/@prisma/client");
const { PrismaClient } = require(prismaClientPath);
const dbPath = path.resolve(__dirname, "../dashboard/prisma/dev.db");
const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
});

// --- CLI Helpers ---

const args = process.argv.slice(2);
const command = args[0];

function getFlag(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function requireFlag(name: string): string {
  const val = getFlag(name);
  if (!val) {
    console.error(`Required flag: --${name}`);
    process.exit(1);
  }
  return val;
}

// --- API Helpers ---

async function metaFetch<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  if (!ACCESS_TOKEN || !AD_ACCOUNT_ID) {
    throw new Error("Meta Ads credentials not configured in dashboard/.env (META_ACCESS_TOKEN, META_AD_ACCOUNT_ID)");
  }

  const url = new URL(
    endpoint.startsWith("http") ? endpoint : `${API_BASE}/${endpoint}`
  );

  url.searchParams.set("access_token", ACCESS_TOKEN);

  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const { params: _params, ...fetchOptions } = options ?? {};

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions?.headers as Record<string, string>),
    },
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(
      `Meta Ads API error (${data.error.code}): ${data.error.message} [type: ${data.error.type}]`
    );
  }

  if (!res.ok) {
    throw new Error(`Meta Ads API HTTP ${res.status}: ${JSON.stringify(data)}`);
  }

  return data as T;
}

function accountEndpoint(path: string): string {
  return `act_${AD_ACCOUNT_ID}/${path}`;
}

function extractActionValue(
  actions: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!actions) return 0;
  const match = actions.find((a) => a.action_type === actionType);
  return match ? Number(match.value) || 0 : 0;
}

// --- Commands ---

async function main() {
  switch (command) {
    // ----------------------------------------------------------------
    // Connection
    // ----------------------------------------------------------------
    case "check-connection": {
      try {
        const data = await metaFetch<{ id: string; name: string }>(
          `act_${AD_ACCOUNT_ID}`,
          { params: { fields: "id,name" } }
        );
        console.log(JSON.stringify({ connected: true, accountId: data.id, name: data.name }));
      } catch (err) {
        console.log(JSON.stringify({ connected: false, error: err instanceof Error ? err.message : String(err) }));
      }
      break;
    }

    case "account-info": {
      const data = await metaFetch<{
        id: string;
        name: string;
        currency: string;
        timezone_name: string;
        business?: { name: string };
      }>(`act_${AD_ACCOUNT_ID}`, {
        params: { fields: "id,name,currency,timezone_name,business" },
      });
      console.log(JSON.stringify({
        accountId: data.id.replace("act_", ""),
        name: data.name,
        currency: data.currency,
        timezone: data.timezone_name,
        businessName: data.business?.name ?? null,
      }, null, 2));
      break;
    }

    // ----------------------------------------------------------------
    // Campaigns
    // ----------------------------------------------------------------
    case "list-campaigns": {
      const data = await metaFetch<{
        data: Array<{
          id: string;
          name: string;
          status: string;
          objective: string;
          daily_budget?: string;
          lifetime_budget?: string;
          start_time?: string;
          stop_time?: string;
        }>;
      }>(accountEndpoint("campaigns"), {
        params: {
          fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
          limit: "100",
        },
      });

      const campaigns = data.data.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective,
        dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
        lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
        startTime: c.start_time ?? null,
        stopTime: c.stop_time ?? null,
      }));

      console.log(JSON.stringify(campaigns, null, 2));
      break;
    }

    case "create-campaign": {
      const name = requireFlag("name");
      const objective = requireFlag("objective").toUpperCase();
      const status = (getFlag("status") || "PAUSED").toUpperCase();

      const validObjectives = [
        "OUTCOME_LEADS",
        "OUTCOME_TRAFFIC",
        "OUTCOME_AWARENESS",
        "OUTCOME_ENGAGEMENT",
        "OUTCOME_SALES",
      ];
      if (!validObjectives.includes(objective)) {
        console.error(`Invalid objective. Valid values: ${validObjectives.join(", ")}`);
        process.exit(1);
      }

      const data = await metaFetch<{ id: string }>(accountEndpoint("campaigns"), {
        method: "POST",
        body: JSON.stringify({
          name,
          objective,
          status,
          special_ad_categories: [],
        }),
      });

      console.log(JSON.stringify({ id: data.id, name, objective, status, message: "Campaign created (paused). Enable via update-campaign-status." }));
      break;
    }

    case "update-campaign-status": {
      const campaignId = requireFlag("campaignId");
      const status = requireFlag("status").toUpperCase();

      await metaFetch<{ success: boolean }>(`${campaignId}`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });

      console.log(JSON.stringify({ campaignId, status, message: `Campaign status updated to ${status}` }));
      break;
    }

    // ----------------------------------------------------------------
    // Ad Sets
    // ----------------------------------------------------------------
    case "list-adsets": {
      const campaignId = requireFlag("campaignId");

      const data = await metaFetch<{
        data: Array<{
          id: string;
          name: string;
          campaign_id: string;
          status: string;
          daily_budget?: string;
          bid_strategy?: string;
          optimization_goal?: string;
        }>;
      }>(accountEndpoint("adsets"), {
        params: {
          fields: "id,name,campaign_id,status,daily_budget,bid_strategy,optimization_goal",
          campaign_id: campaignId,
          limit: "100",
        },
      });

      const adSets = data.data.map((s) => ({
        id: s.id,
        name: s.name,
        campaignId: s.campaign_id,
        status: s.status,
        dailyBudget: s.daily_budget ? Number(s.daily_budget) / 100 : null,
        bidStrategy: s.bid_strategy ?? null,
        optimizationGoal: s.optimization_goal ?? null,
      }));

      console.log(JSON.stringify(adSets, null, 2));
      break;
    }

    case "create-adset": {
      const campaignId = requireFlag("campaignId");
      const name = requireFlag("name");
      const dailyBudget = parseFloat(requireFlag("dailyBudget"));
      const targetingRaw = getFlag("targeting");
      const targeting = targetingRaw ? JSON.parse(targetingRaw) : { geo_locations: { countries: ["US"] } };

      const body = {
        name,
        campaign_id: campaignId,
        status: "PAUSED",
        billing_event: "IMPRESSIONS",
        optimization_goal: getFlag("optimizationGoal") ?? "LEAD_GENERATION",
        bid_strategy: getFlag("bidStrategy") ?? "LOWEST_COST_WITHOUT_CAP",
        daily_budget: Math.round(dailyBudget * 100).toString(),
        targeting,
      };

      const data = await metaFetch<{ id: string }>(accountEndpoint("adsets"), {
        method: "POST",
        body: JSON.stringify(body),
      });

      console.log(JSON.stringify({ id: data.id, name, campaignId, message: "Ad set created (paused)" }));
      break;
    }

    // ----------------------------------------------------------------
    // Ads
    // ----------------------------------------------------------------
    case "create-ad": {
      const adSetId = requireFlag("adSetId");
      const name = requireFlag("name");
      const body = requireFlag("body");
      const linkUrl = requireFlag("linkUrl");
      const callToAction = requireFlag("callToAction").toUpperCase();
      const pageId = getFlag("pageId") ?? "";
      const imageHash = getFlag("imageHash");
      const title = getFlag("title");

      if (!pageId) {
        console.error("--pageId is required for Meta Ads (your Facebook Page ID)");
        process.exit(1);
      }

      // Create creative
      const creativeBody: Record<string, unknown> = {
        name: `${name} Creative`,
        object_story_spec: {
          page_id: pageId,
          link_data: {
            message: body,
            link: linkUrl,
            call_to_action: {
              type: callToAction,
              value: { link: linkUrl },
            },
            ...(title ? { name: title } : {}),
            ...(imageHash ? { image_hash: imageHash } : {}),
          },
        },
      };

      const creativeData = await metaFetch<{ id: string }>(
        accountEndpoint("adcreatives"),
        { method: "POST", body: JSON.stringify(creativeBody) }
      );

      // Create ad
      const adData = await metaFetch<{ id: string }>(accountEndpoint("ads"), {
        method: "POST",
        body: JSON.stringify({
          name,
          adset_id: adSetId,
          creative: { creative_id: creativeData.id },
          status: "PAUSED",
        }),
      });

      console.log(JSON.stringify({ adId: adData.id, creativeId: creativeData.id, name, adSetId, message: "Ad created (paused)" }));
      break;
    }

    // ----------------------------------------------------------------
    // Reporting
    // ----------------------------------------------------------------
    case "campaign-performance": {
      const campaignId = requireFlag("campaignId");
      const startDate = requireFlag("startDate");
      const endDate = requireFlag("endDate");
      const timeRange = JSON.stringify({ since: startDate, until: endDate });

      const data = await metaFetch<{
        data: Array<{
          impressions?: string;
          clicks?: string;
          ctr?: string;
          spend?: string;
          actions?: Array<{ action_type: string; value: string }>;
          cost_per_action_type?: Array<{ action_type: string; value: string }>;
          cpm?: string;
          reach?: string;
          frequency?: string;
          date_start: string;
          date_stop: string;
        }>;
      }>(`${campaignId}/insights`, {
        params: {
          fields: "impressions,clicks,ctr,spend,actions,cost_per_action_type,cpm,reach,frequency",
          time_range: timeRange,
          level: "campaign",
        },
      });

      const row = data.data[0];
      if (!row) {
        console.log(JSON.stringify({ campaignId, dateRange: { startDate, endDate }, message: "No data for this date range" }));
        break;
      }

      const conversions =
        extractActionValue(row.actions, "lead") +
        extractActionValue(row.actions, "complete_registration");

      console.log(JSON.stringify({
        campaignId,
        dateRange: { startDate, endDate },
        impressions: Number(row.impressions) || 0,
        clicks: Number(row.clicks) || 0,
        ctr: Number(row.ctr) || 0,
        spend: Number(row.spend) || 0,
        conversions,
        cpm: Number(row.cpm) || 0,
        reach: Number(row.reach) || 0,
        frequency: Number(row.frequency) || 0,
      }, null, 2));
      break;
    }

    case "account-performance": {
      const startDate = requireFlag("startDate");
      const endDate = requireFlag("endDate");
      const timeRange = JSON.stringify({ since: startDate, until: endDate });

      const data = await metaFetch<{
        data: Array<{
          campaign_id?: string;
          impressions?: string;
          clicks?: string;
          ctr?: string;
          spend?: string;
          actions?: Array<{ action_type: string; value: string }>;
          cpm?: string;
          reach?: string;
          date_start: string;
          date_stop: string;
        }>;
      }>(accountEndpoint("insights"), {
        params: {
          fields: "campaign_id,impressions,clicks,ctr,spend,actions,cpm,reach",
          time_range: timeRange,
          level: "campaign",
          limit: "100",
        },
      });

      const rows = data.data.map((row) => ({
        campaignId: row.campaign_id ?? null,
        impressions: Number(row.impressions) || 0,
        clicks: Number(row.clicks) || 0,
        ctr: Number(row.ctr) || 0,
        spend: Number(row.spend) || 0,
        conversions:
          extractActionValue(row.actions, "lead") +
          extractActionValue(row.actions, "complete_registration"),
        cpm: Number(row.cpm) || 0,
        reach: Number(row.reach) || 0,
        dateStart: row.date_start,
        dateStop: row.date_stop,
      }));

      const totals = rows.reduce(
        (acc, r) => ({
          impressions: acc.impressions + r.impressions,
          clicks: acc.clicks + r.clicks,
          spend: acc.spend + r.spend,
          conversions: acc.conversions + r.conversions,
          reach: acc.reach + r.reach,
        }),
        { impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0 }
      );

      console.log(JSON.stringify({ dateRange: { startDate, endDate }, campaigns: rows, totals }, null, 2));
      break;
    }

    // ----------------------------------------------------------------
    // Sync
    // ----------------------------------------------------------------
    case "sync-push": {
      const localCampaignId = requireFlag("campaignId");

      const campaign = await prisma.campaign.findUnique({
        where: { id: localCampaignId },
        include: {
          adGroups: {
            where: { platform: "meta_ads" },
            include: { creatives: true },
          },
        },
      });

      if (!campaign) {
        console.error(`Campaign not found: ${localCampaignId}`);
        process.exit(1);
      }

      const existing = campaign.metadata ? JSON.parse(campaign.metadata) : {};
      const syncLog: Record<string, unknown>[] = [];

      // Push campaign if not yet synced
      if (!existing.metaAds?.campaignId) {
        const metaCampaign = await metaFetch<{ id: string }>(
          accountEndpoint("campaigns"),
          {
            method: "POST",
            body: JSON.stringify({
              name: campaign.name,
              objective: "OUTCOME_LEADS",
              status: "PAUSED",
              special_ad_categories: [],
            }),
          }
        );

        existing.metaAds = {
          campaignId: metaCampaign.id,
          adSetIds: [],
          status: "PAUSED",
          syncedAt: new Date().toISOString(),
        };

        await prisma.campaign.update({
          where: { id: localCampaignId },
          data: { metadata: JSON.stringify(existing) },
        });

        syncLog.push({ type: "campaign", action: "created", metaCampaignId: metaCampaign.id });
      } else {
        syncLog.push({ type: "campaign", action: "already_synced", metaCampaignId: existing.metaAds.campaignId });
      }

      const metaCampaignId = existing.metaAds.campaignId;

      // Push ad sets
      for (const adGroup of campaign.adGroups) {
        const agMeta = adGroup.metadata ? JSON.parse(adGroup.metadata) : {};

        if (agMeta.metaAds?.adSetId) {
          syncLog.push({ type: "ad_set", action: "already_synced", name: adGroup.name, adSetId: agMeta.metaAds.adSetId });
          continue;
        }

        // Build targeting from ad group targeting JSON
        const agTargeting = adGroup.targeting ? JSON.parse(adGroup.targeting) : {};
        const targetingSpec: Record<string, unknown> = {
          geo_locations: agTargeting.locations
            ? { countries: agTargeting.locations }
            : { countries: ["US"] },
        };

        if (agTargeting.ageMin !== undefined) targetingSpec.age_min = agTargeting.ageMin;
        if (agTargeting.ageMax !== undefined) targetingSpec.age_max = agTargeting.ageMax;

        const dailyBudget = adGroup.budget
          ? Math.round((adGroup.budget / 30) * 100).toString()
          : "1000"; // $10/day fallback

        const adSetBody = {
          name: adGroup.name,
          campaign_id: metaCampaignId,
          status: "PAUSED",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LEAD_GENERATION",
          bid_strategy: "LOWEST_COST_WITHOUT_CAP",
          daily_budget: dailyBudget,
          targeting: targetingSpec,
        };

        const adSetData = await metaFetch<{ id: string }>(
          accountEndpoint("adsets"),
          { method: "POST", body: JSON.stringify(adSetBody) }
        );

        agMeta.metaAds = {
          adSetId: adSetData.id,
          status: "PAUSED",
          syncedAt: new Date().toISOString(),
        };

        await prisma.adGroup.update({
          where: { id: adGroup.id },
          data: { metadata: JSON.stringify(agMeta) },
        });

        // Track adSetId at campaign level
        if (!existing.metaAds.adSetIds) existing.metaAds.adSetIds = [];
        existing.metaAds.adSetIds.push(adSetData.id);
        await prisma.campaign.update({
          where: { id: localCampaignId },
          data: { metadata: JSON.stringify(existing) },
        });

        syncLog.push({ type: "ad_set", action: "created", name: adGroup.name, adSetId: adSetData.id });

        // Push creatives as ads (require a pageId in metadata or env)
        const pageId = process.env.META_PAGE_ID || agTargeting.pageId || "";

        for (const creative of adGroup.creatives) {
          if (creative.format === "responsive_search") continue; // skip Google-only formats

          const crMeta = creative.metadata ? JSON.parse(creative.metadata) : {};
          if (crMeta.metaAds?.adId) continue;

          if (!pageId) {
            syncLog.push({ type: "ad", action: "skipped_no_page_id", headline: creative.headline });
            continue;
          }

          const creativeBody = {
            name: `${creative.headline} Creative`,
            object_story_spec: {
              page_id: pageId,
              link_data: {
                message: creative.description || creative.headline,
                link: creative.landingUrl || "https://zavis.ai",
                name: creative.headline,
                call_to_action: {
                  type: (creative.cta || "LEARN_MORE").toUpperCase().replace(/\s+/g, "_"),
                  value: { link: creative.landingUrl || "https://zavis.ai" },
                },
              },
            },
          };

          const metaCreative = await metaFetch<{ id: string }>(
            accountEndpoint("adcreatives"),
            { method: "POST", body: JSON.stringify(creativeBody) }
          );

          const adBody = {
            name: creative.headline,
            adset_id: adSetData.id,
            creative: { creative_id: metaCreative.id },
            status: "PAUSED",
          };

          const metaAd = await metaFetch<{ id: string }>(
            accountEndpoint("ads"),
            { method: "POST", body: JSON.stringify(adBody) }
          );

          crMeta.metaAds = {
            adId: metaAd.id,
            creativeId: metaCreative.id,
            syncedAt: new Date().toISOString(),
          };

          await prisma.adCreative.update({
            where: { id: creative.id },
            data: { metadata: JSON.stringify(crMeta) },
          });

          syncLog.push({ type: "ad", action: "created", headline: creative.headline, adId: metaAd.id });
        }
      }

      console.log(JSON.stringify({ campaignId: localCampaignId, sync: syncLog }, null, 2));
      break;
    }

    case "sync-pull": {
      const localCampaignId = requireFlag("campaignId");

      const localCampaign = await prisma.campaign.findUnique({ where: { id: localCampaignId } });
      if (!localCampaign) {
        console.error(`Local campaign not found: ${localCampaignId}`);
        process.exit(1);
      }

      const meta = localCampaign.metadata ? JSON.parse(localCampaign.metadata) : {};
      const metaCampaignId = meta.metaAds?.campaignId;

      if (!metaCampaignId) {
        console.error("Campaign is not synced to Meta Ads. Run sync-push first.");
        process.exit(1);
      }

      // Pull campaign status from Meta
      const campaignData = await metaFetch<{
        id: string;
        name: string;
        status: string;
        objective: string;
        daily_budget?: string;
        lifetime_budget?: string;
      }>(`${metaCampaignId}`, {
        params: { fields: "id,name,status,objective,daily_budget,lifetime_budget" },
      });

      meta.metaAds.status = campaignData.status;
      meta.metaAds.syncedAt = new Date().toISOString();

      await prisma.campaign.update({
        where: { id: localCampaignId },
        data: { metadata: JSON.stringify(meta) },
      });

      // Pull ad set statuses
      const adSetIds: string[] = meta.metaAds.adSetIds ?? [];
      const adSetResults: Array<{ id: string; name: string; status: string }> = [];

      for (const adSetId of adSetIds) {
        try {
          const adSetData = await metaFetch<{ id: string; name: string; status: string }>(
            `${adSetId}`,
            { params: { fields: "id,name,status" } }
          );
          adSetResults.push(adSetData);
        } catch {
          adSetResults.push({ id: adSetId, name: "unknown", status: "ERROR" });
        }
      }

      console.log(JSON.stringify({
        synced: true,
        campaign: { id: campaignData.id, name: campaignData.name, status: campaignData.status },
        adSets: adSetResults,
        message: `Pulled campaign "${campaignData.name}" with ${adSetResults.length} ad sets`,
      }, null, 2));
      break;
    }

    case "pull-metrics": {
      const localCampaignId = requireFlag("campaignId");

      const localCampaign = await prisma.campaign.findUnique({ where: { id: localCampaignId } });
      if (!localCampaign) {
        console.error(`Local campaign not found: ${localCampaignId}`);
        process.exit(1);
      }

      const meta = localCampaign.metadata ? JSON.parse(localCampaign.metadata) : {};
      const metaCampaignId = meta.metaAds?.campaignId;

      if (!metaCampaignId) {
        console.error("Campaign is not synced to Meta Ads. Run sync-push first.");
        process.exit(1);
      }

      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startDate = thirtyDaysAgo.toISOString().slice(0, 10);
      const endDate = today.toISOString().slice(0, 10);
      const timeRange = JSON.stringify({ since: startDate, until: endDate });

      const insightData = await metaFetch<{
        data: Array<{
          impressions?: string;
          clicks?: string;
          ctr?: string;
          spend?: string;
          actions?: Array<{ action_type: string; value: string }>;
          cost_per_action_type?: Array<{ action_type: string; value: string }>;
          cpm?: string;
          reach?: string;
          frequency?: string;
          date_start: string;
          date_stop: string;
        }>;
      }>(`${metaCampaignId}/insights`, {
        params: {
          fields: "impressions,clicks,ctr,spend,actions,cost_per_action_type,cpm,reach,frequency",
          time_range: timeRange,
          level: "campaign",
        },
      });

      const row = insightData.data[0];
      if (!row) {
        console.log(JSON.stringify({ campaignId: localCampaignId, message: "No data for the last 30 days" }));
        break;
      }

      const conversions =
        extractActionValue(row.actions, "lead") +
        extractActionValue(row.actions, "complete_registration");

      const metricsObj = {
        campaignId: metaCampaignId,
        impressions: Number(row.impressions) || 0,
        clicks: Number(row.clicks) || 0,
        ctr: Number(row.ctr) || 0,
        spend: Number(row.spend) || 0,
        conversions,
        costPerConversion:
          extractActionValue(row.cost_per_action_type, "lead") ||
          extractActionValue(row.cost_per_action_type, "complete_registration") ||
          0,
        cpm: Number(row.cpm) || 0,
        reach: Number(row.reach) || 0,
        frequency: Number(row.frequency) || 0,
        dateStart: row.date_start,
        dateStop: row.date_stop,
      };

      // Store metrics in campaign metadata
      meta.metaAds.metrics = metricsObj;
      meta.metaAds.lastMetricsPull = new Date().toISOString();

      await prisma.campaign.update({
        where: { id: localCampaignId },
        data: { metadata: JSON.stringify(meta) },
      });

      // Write individual MetricSnapshots to the DB
      const project = await prisma.project.findFirst();
      if (project) {
        const snapshotData = [
          { metricType: "impressions", value: metricsObj.impressions },
          { metricType: "clicks", value: metricsObj.clicks },
          { metricType: "ctr", value: metricsObj.ctr },
          { metricType: "spend", value: metricsObj.spend },
          { metricType: "conversions", value: metricsObj.conversions },
          { metricType: "cpa", value: metricsObj.costPerConversion },
          { metricType: "cpm", value: metricsObj.cpm },
          { metricType: "reach", value: metricsObj.reach },
        ];

        for (const snap of snapshotData) {
          await prisma.metricSnapshot.create({
            data: {
              projectId: project.id,
              campaignId: localCampaignId,
              channel: "meta_ads",
              metricType: snap.metricType,
              value: snap.value,
              period: "monthly",
              metadata: JSON.stringify({ dateRange: { start: startDate, end: endDate } }),
            },
          });
        }

        console.log(JSON.stringify({
          campaignId: localCampaignId,
          metrics: metricsObj,
          snapshotsCreated: snapshotData.length,
        }, null, 2));
      } else {
        console.log(JSON.stringify({ campaignId: localCampaignId, metrics: metricsObj }, null, 2));
      }

      break;
    }

    default:
      console.error(
        "Usage: npx tsx scripts/meta-ads-client.ts <command>\n\n" +
        "Connection:\n" +
        "  check-connection             Test API connectivity\n" +
        "  account-info                 Show ad account details\n\n" +
        "Campaigns:\n" +
        "  list-campaigns               List all campaigns\n" +
        "  create-campaign              Create campaign (--name, --objective)\n" +
        "  update-campaign-status       Update status (--campaignId, --status)\n\n" +
        "Ad Sets:\n" +
        "  list-adsets                  List ad sets (--campaignId)\n" +
        "  create-adset                 Create ad set (--campaignId, --name, --dailyBudget)\n\n" +
        "Ads:\n" +
        "  create-ad                    Create ad (--adSetId, --name, --body, --linkUrl, --callToAction, --pageId)\n\n" +
        "Reports:\n" +
        "  campaign-performance         Campaign metrics (--campaignId, --startDate, --endDate)\n" +
        "  account-performance          Account metrics (--startDate, --endDate)\n\n" +
        "Sync:\n" +
        "  sync-push                    Push to Meta Ads (--campaignId)\n" +
        "  sync-pull                    Pull from Meta Ads (--campaignId)\n" +
        "  pull-metrics                 Pull insights into MetricSnapshot (--campaignId)\n"
      );
      process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
