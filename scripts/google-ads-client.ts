/**
 * google-ads-client.ts -- CLI utility for the CMO agent (runtime) to interact with Google Ads.
 *
 * Usage:
 *   npx tsx scripts/google-ads-client.ts <command> [flags]
 *
 * Connection:
 *   check-connection                       Test API connectivity
 *   list-accounts                          Show account info
 *
 * Campaign Management:
 *   list-campaigns                         List all campaigns
 *   create-campaign                        Create a new campaign (PAUSED)
 *   update-campaign-status                 Enable/pause/remove a campaign
 *
 * Ad Group Management:
 *   list-ad-groups --campaignId <id>       List ad groups
 *   create-ad-group                        Create ad group
 *
 * Ad Creation:
 *   create-search-ad                       Create responsive search ad
 *
 * Keywords:
 *   add-keywords --adGroupId --keywords    Add keywords
 *   add-negative-keywords                  Add negative keywords
 *
 * Reporting:
 *   campaign-performance                   Campaign metrics
 *   ad-group-performance                   Ad group metrics
 *   keyword-performance                    Keyword metrics
 *   search-terms                           Search terms report
 *
 * Sync:
 *   sync-push --campaignId <localId>       Push local campaign to Google Ads
 *   sync-pull --googleCampaignId --localCampaignId
 *   pull-metrics --localCampaignId --startDate --endDate
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

const CLIENT_ID = envVar("GOOGLE_ADS_CLIENT_ID");
const CLIENT_SECRET = envVar("GOOGLE_ADS_CLIENT_SECRET");
const REFRESH_TOKEN = envVar("GOOGLE_ADS_REFRESH_TOKEN");
const DEVELOPER_TOKEN = envVar("GOOGLE_ADS_DEVELOPER_TOKEN");
const CUSTOMER_ID = envVar("GOOGLE_ADS_CUSTOMER_ID");
const LOGIN_CUSTOMER_ID = envVar("GOOGLE_ADS_LOGIN_CUSTOMER_ID");

const API_BASE = "https://googleads.googleapis.com/v18";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

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

// --- Token Management ---

let cachedAccessToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiry) return cachedAccessToken;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error("Google Ads OAuth credentials not configured in dashboard/.env");
  }

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`OAuth error: ${data.error} -- ${data.error_description}`);

  cachedAccessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return data.access_token;
}

// --- API Helpers ---

async function googleAdsFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": DEVELOPER_TOKEN,
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (LOGIN_CUSTOMER_ID) headers["login-customer-id"] = LOGIN_CUSTOMER_ID;

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Ads API ${res.status}: ${errText}`);
  }

  return res.json() as Promise<T>;
}

async function query(gaql: string): Promise<Record<string, unknown>[]> {
  const data = await googleAdsFetch<Array<{ results?: Record<string, unknown>[] }>>(
    `/customers/${CUSTOMER_ID}/googleAds:searchStream`,
    { method: "POST", body: JSON.stringify({ query: gaql }) }
  );
  const results: Record<string, unknown>[] = [];
  for (const batch of data) {
    if (batch.results) results.push(...batch.results);
  }
  return results;
}

async function mutate(resource: string, operations: Record<string, unknown>[]): Promise<Record<string, unknown>> {
  return googleAdsFetch(`/customers/${CUSTOMER_ID}/${resource}:mutate`, {
    method: "POST",
    body: JSON.stringify({ operations }),
  });
}

function toMicros(usd: number): number {
  return Math.round(usd * 1_000_000);
}

function fromMicros(micros: string | number): number {
  return Number(micros) / 1_000_000;
}

// --- Commands ---

async function main() {
  switch (command) {
    // --- Connection ---
    case "check-connection": {
      try {
        await getAccessToken();
        const results = await query("SELECT customer.id FROM customer LIMIT 1");
        console.log(JSON.stringify({ connected: true, customerId: (results[0]?.customer as Record<string, string>)?.id }));
      } catch (err) {
        console.log(JSON.stringify({ connected: false, error: err instanceof Error ? err.message : String(err) }));
      }
      break;
    }

    case "list-accounts": {
      const results = await query(
        "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1"
      );
      const c = results[0]?.customer as Record<string, string>;
      console.log(JSON.stringify({
        customerId: c.id,
        name: c.descriptiveName,
        currency: c.currencyCode,
        timeZone: c.timeZone,
      }, null, 2));
      break;
    }

    // --- Campaigns ---
    case "list-campaigns": {
      const results = await query(`
        SELECT campaign.resource_name, campaign.id, campaign.name, campaign.status,
               campaign.advertising_channel_type, campaign.start_date, campaign.end_date,
               campaign_budget.amount_micros, campaign.bidding_strategy_type
        FROM campaign WHERE campaign.status != 'REMOVED' ORDER BY campaign.name
      `);

      const campaigns = results.map((r) => {
        const c = r.campaign as Record<string, string>;
        const b = r.campaignBudget as Record<string, string> | undefined;
        return {
          resourceName: c.resourceName,
          id: c.id,
          name: c.name,
          status: c.status,
          channelType: c.advertisingChannelType,
          dailyBudgetUsd: b ? fromMicros(b.amountMicros) : null,
          bidStrategy: c.biddingStrategyType,
          startDate: c.startDate,
          endDate: c.endDate,
        };
      });
      console.log(JSON.stringify(campaigns, null, 2));
      break;
    }

    case "create-campaign": {
      const name = requireFlag("name");
      const budget = parseFloat(requireFlag("budget"));
      const bidStrategy = requireFlag("bidStrategy").toUpperCase();
      const channelType = (getFlag("channelType") || "SEARCH").toUpperCase();
      const targetCpa = getFlag("targetCpa");
      const targetRoas = getFlag("targetRoas");
      const startDate = getFlag("startDate");
      const endDate = getFlag("endDate");

      // Create budget
      const budgetResult = await mutate("campaignBudgets", [{
        create: {
          name: `${name} Budget`,
          amountMicros: toMicros(budget).toString(),
          deliveryMethod: "STANDARD",
        },
      }]);
      const budgetRN = (budgetResult as { results: Array<{ resourceName: string }> }).results[0].resourceName;

      // Create campaign
      const campaignCreate: Record<string, unknown> = {
        name,
        status: "PAUSED",
        advertisingChannelType: channelType,
        campaignBudget: budgetRN,
        startDate: startDate?.replace(/-/g, ""),
        endDate: endDate?.replace(/-/g, ""),
      };

      switch (bidStrategy) {
        case "MAXIMIZE_CONVERSIONS":
          campaignCreate.maximizeConversions = {};
          break;
        case "TARGET_CPA":
          campaignCreate.maximizeConversions = { targetCpaMicros: targetCpa ? toMicros(parseFloat(targetCpa)).toString() : undefined };
          break;
        case "TARGET_ROAS":
          campaignCreate.maximizeConversionValue = { targetRoas: targetRoas ? parseFloat(targetRoas) : undefined };
          break;
        case "MANUAL_CPC":
          campaignCreate.manualCpc = { enhancedCpcEnabled: true };
          break;
      }

      const result = await mutate("campaigns", [{ create: campaignCreate }]);
      const rn = (result as { results: Array<{ resourceName: string }> }).results[0].resourceName;
      console.log(JSON.stringify({ resourceName: rn, status: "PAUSED", message: "Campaign created (paused). Enable it via update-campaign-status." }));
      break;
    }

    case "update-campaign-status": {
      const resourceName = requireFlag("resourceName");
      const status = requireFlag("status").toUpperCase();
      await mutate("campaigns", [{ update: { resourceName, status }, updateMask: "status" }]);
      console.log(JSON.stringify({ resourceName, status, message: `Campaign ${status.toLowerCase()}` }));
      break;
    }

    // --- Ad Groups ---
    case "list-ad-groups": {
      const campaignId = requireFlag("campaignId");
      const results = await query(`
        SELECT ad_group.resource_name, ad_group.id, ad_group.name, ad_group.status,
               ad_group.type, ad_group.cpc_bid_micros
        FROM ad_group WHERE campaign.id = ${campaignId} AND ad_group.status != 'REMOVED'
        ORDER BY ad_group.name
      `);

      const adGroups = results.map((r) => {
        const ag = r.adGroup as Record<string, string>;
        return {
          resourceName: ag.resourceName,
          id: ag.id,
          name: ag.name,
          status: ag.status,
          type: ag.type,
          cpcBidUsd: ag.cpcBidMicros ? fromMicros(ag.cpcBidMicros) : null,
        };
      });
      console.log(JSON.stringify(adGroups, null, 2));
      break;
    }

    case "create-ad-group": {
      const campaignResourceName = requireFlag("campaignId"); // accepts resource name or will be prefixed
      const name = requireFlag("name");
      const type = (getFlag("type") || "SEARCH_STANDARD").toUpperCase();
      const cpcBid = getFlag("cpcBid");

      const campaignRN = campaignResourceName.startsWith("customers/")
        ? campaignResourceName
        : `customers/${CUSTOMER_ID}/campaigns/${campaignResourceName}`;

      const result = await mutate("adGroups", [{
        create: {
          name,
          campaign: campaignRN,
          type,
          status: "ENABLED",
          cpcBidMicros: cpcBid ? toMicros(parseFloat(cpcBid)).toString() : undefined,
        },
      }]);
      const rn = (result as { results: Array<{ resourceName: string }> }).results[0].resourceName;
      console.log(JSON.stringify({ resourceName: rn, message: "Ad group created" }));
      break;
    }

    // --- Ads ---
    case "create-search-ad": {
      const adGroupId = requireFlag("adGroupId");
      const headlines = JSON.parse(requireFlag("headlines")) as string[];
      const descriptions = JSON.parse(requireFlag("descriptions")) as string[];
      const finalUrl = requireFlag("finalUrl");
      const path1 = getFlag("path1");
      const path2 = getFlag("path2");

      const adGroupRN = adGroupId.startsWith("customers/")
        ? adGroupId
        : `customers/${CUSTOMER_ID}/adGroups/${adGroupId}`;

      const result = await mutate("adGroupAds", [{
        create: {
          adGroup: adGroupRN,
          ad: {
            responsiveSearchAd: {
              headlines: headlines.map((text) => ({ text })),
              descriptions: descriptions.map((text) => ({ text })),
              path1,
              path2,
            },
            finalUrls: [finalUrl],
          },
          status: "ENABLED",
        },
      }]);
      const rn = (result as { results: Array<{ resourceName: string }> }).results[0].resourceName;
      console.log(JSON.stringify({ resourceName: rn, message: "Responsive search ad created" }));
      break;
    }

    // --- Keywords ---
    case "add-keywords": {
      const adGroupId = requireFlag("adGroupId");
      const keywords = JSON.parse(requireFlag("keywords")) as Array<{ keyword: string; matchType: string; bid?: number }>;

      const adGroupRN = adGroupId.startsWith("customers/")
        ? adGroupId
        : `customers/${CUSTOMER_ID}/adGroups/${adGroupId}`;

      const operations = keywords.map((kw) => ({
        create: {
          adGroup: adGroupRN,
          keyword: { text: kw.keyword, matchType: kw.matchType.toUpperCase() },
          status: "ENABLED",
          cpcBidMicros: kw.bid ? toMicros(kw.bid).toString() : undefined,
        },
      }));

      const result = await mutate("adGroupCriteria", operations);
      const resourceNames = (result as { results: Array<{ resourceName: string }> }).results.map((r) => r.resourceName);
      console.log(JSON.stringify({ added: resourceNames.length, resourceNames }));
      break;
    }

    case "add-negative-keywords": {
      const campaignId = requireFlag("campaignId");
      const keywords = JSON.parse(requireFlag("keywords")) as string[];

      const campaignRN = campaignId.startsWith("customers/")
        ? campaignId
        : `customers/${CUSTOMER_ID}/campaigns/${campaignId}`;

      const operations = keywords.map((kw) => ({
        create: {
          campaign: campaignRN,
          keyword: { text: kw, matchType: "BROAD" },
          negative: true,
        },
      }));

      const result = await mutate("campaignCriteria", operations);
      const resourceNames = (result as { results: Array<{ resourceName: string }> }).results.map((r) => r.resourceName);
      console.log(JSON.stringify({ added: resourceNames.length, resourceNames }));
      break;
    }

    // --- Reporting ---
    case "campaign-performance": {
      const startDate = requireFlag("startDate");
      const endDate = requireFlag("endDate");

      const results = await query(`
        SELECT campaign.id, campaign.name, campaign.status,
               metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc,
               metrics.cost_micros, metrics.conversions, metrics.conversions_value, metrics.cost_per_conversion
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}' AND campaign.status != 'REMOVED'
        ORDER BY metrics.cost_micros DESC
      `);

      const rows = results.map((r) => {
        const c = r.campaign as Record<string, string>;
        const m = r.metrics as Record<string, string | number>;
        return {
          campaignId: c.id, name: c.name, status: c.status,
          impressions: Number(m.impressions) || 0,
          clicks: Number(m.clicks) || 0,
          ctr: Number(m.ctr) || 0,
          avgCpcUsd: fromMicros(m.averageCpc || 0),
          spendUsd: fromMicros(m.costMicros || 0),
          conversions: Number(m.conversions) || 0,
          conversionValue: Number(m.conversionsValue) || 0,
          cpaUsd: fromMicros(m.costPerConversion || 0),
        };
      });
      console.log(JSON.stringify({ dateRange: { startDate, endDate }, campaigns: rows }, null, 2));
      break;
    }

    case "ad-group-performance": {
      const campaignId = requireFlag("campaignId");
      const startDate = requireFlag("startDate");
      const endDate = requireFlag("endDate");

      const results = await query(`
        SELECT ad_group.id, ad_group.name, ad_group.status,
               metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc,
               metrics.cost_micros, metrics.conversions, metrics.cost_per_conversion
        FROM ad_group
        WHERE campaign.id = ${campaignId}
          AND segments.date BETWEEN '${startDate}' AND '${endDate}'
          AND ad_group.status != 'REMOVED'
        ORDER BY metrics.cost_micros DESC
      `);

      const rows = results.map((r) => {
        const ag = r.adGroup as Record<string, string>;
        const m = r.metrics as Record<string, string | number>;
        return {
          adGroupId: ag.id, name: ag.name, status: ag.status,
          impressions: Number(m.impressions) || 0,
          clicks: Number(m.clicks) || 0,
          ctr: Number(m.ctr) || 0,
          avgCpcUsd: fromMicros(m.averageCpc || 0),
          spendUsd: fromMicros(m.costMicros || 0),
          conversions: Number(m.conversions) || 0,
          cpaUsd: fromMicros(m.costPerConversion || 0),
        };
      });
      console.log(JSON.stringify({ campaignId, dateRange: { startDate, endDate }, adGroups: rows }, null, 2));
      break;
    }

    case "keyword-performance": {
      const campaignId = requireFlag("campaignId");
      const startDate = requireFlag("startDate");
      const endDate = requireFlag("endDate");

      const results = await query(`
        SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
               metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc,
               metrics.cost_micros, metrics.conversions
        FROM keyword_view
        WHERE campaign.id = ${campaignId}
          AND segments.date BETWEEN '${startDate}' AND '${endDate}'
        ORDER BY metrics.impressions DESC LIMIT 100
      `);

      const rows = results.map((r) => {
        const kw = r.adGroupCriterion as { keyword: Record<string, string> };
        const m = r.metrics as Record<string, string | number>;
        return {
          keyword: kw.keyword.text, matchType: kw.keyword.matchType,
          impressions: Number(m.impressions) || 0,
          clicks: Number(m.clicks) || 0,
          ctr: Number(m.ctr) || 0,
          avgCpcUsd: fromMicros(m.averageCpc || 0),
          spendUsd: fromMicros(m.costMicros || 0),
          conversions: Number(m.conversions) || 0,
        };
      });
      console.log(JSON.stringify({ campaignId, dateRange: { startDate, endDate }, keywords: rows }, null, 2));
      break;
    }

    case "search-terms": {
      const campaignId = requireFlag("campaignId");
      const startDate = requireFlag("startDate");
      const endDate = requireFlag("endDate");

      const results = await query(`
        SELECT search_term_view.search_term,
               metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
        FROM search_term_view
        WHERE campaign.id = ${campaignId}
          AND segments.date BETWEEN '${startDate}' AND '${endDate}'
        ORDER BY metrics.impressions DESC LIMIT 100
      `);

      const rows = results.map((r) => {
        const st = r.searchTermView as Record<string, string>;
        const m = r.metrics as Record<string, string | number>;
        return {
          searchTerm: st.searchTerm,
          impressions: Number(m.impressions) || 0,
          clicks: Number(m.clicks) || 0,
          spendUsd: fromMicros(m.costMicros || 0),
          conversions: Number(m.conversions) || 0,
        };
      });
      console.log(JSON.stringify({ campaignId, dateRange: { startDate, endDate }, searchTerms: rows }, null, 2));
      break;
    }

    // --- Sync ---
    case "sync-push": {
      const localCampaignId = requireFlag("campaignId");

      // Read local campaign with ad groups and creatives
      const campaign = await prisma.campaign.findUnique({
        where: { id: localCampaignId },
        include: {
          adGroups: {
            where: { platform: "google_ads" },
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
      if (!existing.googleAds?.resourceName) {
        const bidStrategy = campaign.adGroups[0]?.bidStrategy?.toUpperCase() || "MAXIMIZE_CONVERSIONS";

        // Create budget
        const budgetResult = await mutate("campaignBudgets", [{
          create: {
            name: `${campaign.name} Budget`,
            amountMicros: toMicros(campaign.budget || 100).toString(),
            deliveryMethod: "STANDARD",
          },
        }]);
        const budgetRN = (budgetResult as { results: Array<{ resourceName: string }> }).results[0].resourceName;

        const campaignCreate: Record<string, unknown> = {
          name: campaign.name,
          status: "PAUSED",
          advertisingChannelType: "SEARCH",
          campaignBudget: budgetRN,
        };

        if (campaign.startDate) campaignCreate.startDate = campaign.startDate.toISOString().slice(0, 10).replace(/-/g, "");
        if (campaign.endDate) campaignCreate.endDate = campaign.endDate.toISOString().slice(0, 10).replace(/-/g, "");

        switch (bidStrategy) {
          case "MAXIMIZE_CONVERSIONS": campaignCreate.maximizeConversions = {}; break;
          case "TARGET_CPA": campaignCreate.maximizeConversions = {}; break;
          case "TARGET_ROAS": campaignCreate.maximizeConversionValue = {}; break;
          default: campaignCreate.manualCpc = { enhancedCpcEnabled: true };
        }

        const result = await mutate("campaigns", [{ create: campaignCreate }]);
        const rn = (result as { results: Array<{ resourceName: string }> }).results[0].resourceName;

        existing.googleAds = {
          resourceName: rn,
          googleId: rn.split("/").pop(),
          status: "PAUSED",
          syncedAt: new Date().toISOString(),
        };

        await prisma.campaign.update({
          where: { id: localCampaignId },
          data: { metadata: JSON.stringify(existing) },
        });

        syncLog.push({ type: "campaign", action: "created", resourceName: rn });
      } else {
        syncLog.push({ type: "campaign", action: "already_synced", resourceName: existing.googleAds.resourceName });
      }

      const campaignRN = existing.googleAds.resourceName;

      // Push ad groups
      for (const adGroup of campaign.adGroups) {
        const agMeta = adGroup.metadata ? JSON.parse(adGroup.metadata) : {};

        if (!agMeta.googleAds?.resourceName) {
          const adType = adGroup.adType === "search" ? "SEARCH_STANDARD" : adGroup.adType === "display" ? "DISPLAY_STANDARD" : "SEARCH_STANDARD";

          const result = await mutate("adGroups", [{
            create: {
              name: adGroup.name,
              campaign: campaignRN,
              type: adType,
              status: "ENABLED",
              cpcBidMicros: adGroup.budget ? toMicros(adGroup.budget / 30).toString() : undefined,
            },
          }]);
          const rn = (result as { results: Array<{ resourceName: string }> }).results[0].resourceName;

          agMeta.googleAds = {
            resourceName: rn,
            googleId: rn.split("/").pop(),
            status: "ENABLED",
            syncedAt: new Date().toISOString(),
          };

          await prisma.adGroup.update({
            where: { id: adGroup.id },
            data: { metadata: JSON.stringify(agMeta) },
          });

          syncLog.push({ type: "ad_group", action: "created", name: adGroup.name, resourceName: rn });

          // Push keywords if present
          if (adGroup.keywords) {
            const keywords = JSON.parse(adGroup.keywords) as Array<{ keyword: string; matchType: string; bid?: number }>;
            if (keywords.length > 0) {
              const kwOps = keywords.map((kw) => ({
                create: {
                  adGroup: rn,
                  keyword: { text: kw.keyword, matchType: (kw.matchType || "PHRASE").toUpperCase() },
                  status: "ENABLED",
                  cpcBidMicros: kw.bid ? toMicros(kw.bid).toString() : undefined,
                },
              }));
              await mutate("adGroupCriteria", kwOps);
              syncLog.push({ type: "keywords", action: "added", count: keywords.length, adGroup: adGroup.name });
            }
          }

          // Push creatives as responsive search ads
          for (const creative of adGroup.creatives) {
            if (creative.format !== "responsive_search") continue;

            const crMeta = creative.metadata ? JSON.parse(creative.metadata) : {};
            if (crMeta.googleAds?.resourceName) continue;

            const headlines = [creative.headline];
            if (creative.description) headlines.push(creative.description.slice(0, 30));

            const adResult = await mutate("adGroupAds", [{
              create: {
                adGroup: rn,
                ad: {
                  responsiveSearchAd: {
                    headlines: headlines.map((text) => ({ text })),
                    descriptions: [{ text: creative.description || creative.headline }],
                  },
                  finalUrls: [creative.landingUrl || "https://zavis.ai"],
                },
                status: "ENABLED",
              },
            }]);
            const adRN = (adResult as { results: Array<{ resourceName: string }> }).results[0].resourceName;

            crMeta.googleAds = {
              resourceName: adRN,
              googleId: adRN.split("/").pop(),
              syncedAt: new Date().toISOString(),
            };

            await prisma.adCreative.update({
              where: { id: creative.id },
              data: { metadata: JSON.stringify(crMeta) },
            });

            syncLog.push({ type: "ad", action: "created", headline: creative.headline, resourceName: adRN });
          }
        } else {
          syncLog.push({ type: "ad_group", action: "already_synced", name: adGroup.name });
        }
      }

      console.log(JSON.stringify({ campaignId: localCampaignId, sync: syncLog }, null, 2));
      break;
    }

    case "sync-pull": {
      const googleCampaignId = requireFlag("googleCampaignId");
      const localCampaignId = requireFlag("localCampaignId");

      // Fetch campaign from Google Ads
      const campaignResults = await query(`
        SELECT campaign.resource_name, campaign.id, campaign.name, campaign.status,
               campaign.advertising_channel_type, campaign_budget.amount_micros
        FROM campaign WHERE campaign.id = ${googleCampaignId}
      `);

      if (campaignResults.length === 0) {
        console.error(`Google Ads campaign not found: ${googleCampaignId}`);
        process.exit(1);
      }

      const gc = campaignResults[0].campaign as Record<string, string>;
      const gb = campaignResults[0].campaignBudget as Record<string, string> | undefined;

      // Update local campaign metadata
      const localCampaign = await prisma.campaign.findUnique({ where: { id: localCampaignId } });
      const meta = localCampaign?.metadata ? JSON.parse(localCampaign.metadata) : {};
      meta.googleAds = {
        resourceName: gc.resourceName,
        googleId: gc.id,
        status: gc.status,
        dailyBudgetUsd: gb ? fromMicros(gb.amountMicros) : null,
        syncedAt: new Date().toISOString(),
      };

      await prisma.campaign.update({
        where: { id: localCampaignId },
        data: { metadata: JSON.stringify(meta) },
      });

      // Fetch ad groups
      const agResults = await query(`
        SELECT ad_group.resource_name, ad_group.id, ad_group.name, ad_group.status, ad_group.type
        FROM ad_group WHERE campaign.id = ${googleCampaignId} AND ad_group.status != 'REMOVED'
      `);

      console.log(JSON.stringify({
        synced: true,
        campaign: { id: gc.id, name: gc.name, status: gc.status },
        adGroups: agResults.length,
        message: `Pulled campaign ${gc.name} with ${agResults.length} ad groups`,
      }, null, 2));
      break;
    }

    case "pull-metrics": {
      const localCampaignId = requireFlag("localCampaignId");
      const startDate = requireFlag("startDate");
      const endDate = requireFlag("endDate");

      const localCampaign = await prisma.campaign.findUnique({ where: { id: localCampaignId } });
      if (!localCampaign) {
        console.error(`Local campaign not found: ${localCampaignId}`);
        process.exit(1);
      }

      const meta = localCampaign.metadata ? JSON.parse(localCampaign.metadata) : {};
      const googleCampaignId = meta.googleAds?.googleId;
      if (!googleCampaignId) {
        console.error("Campaign is not synced to Google Ads. Run sync-push first.");
        process.exit(1);
      }

      // Pull campaign metrics
      const results = await query(`
        SELECT metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc,
               metrics.cost_micros, metrics.conversions, metrics.conversions_value, metrics.cost_per_conversion
        FROM campaign WHERE campaign.id = ${googleCampaignId}
          AND segments.date BETWEEN '${startDate}' AND '${endDate}'
      `);

      const metrics = results.reduce(
        (acc, r) => {
          const m = r.metrics as Record<string, string | number>;
          return {
            impressions: acc.impressions + (Number(m.impressions) || 0),
            clicks: acc.clicks + (Number(m.clicks) || 0),
            spend: acc.spend + fromMicros(m.costMicros || 0),
            conversions: acc.conversions + (Number(m.conversions) || 0),
            conversionValue: acc.conversionValue + (Number(m.conversionsValue) || 0),
          };
        },
        { impressions: 0, clicks: 0, spend: 0, conversions: 0, conversionValue: 0 }
      );

      const metricsObj = {
        dateRange: { start: startDate, end: endDate },
        ...metrics,
        ctr: metrics.impressions > 0 ? metrics.clicks / metrics.impressions : 0,
        averageCpc: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0,
        costPerConversion: metrics.conversions > 0 ? metrics.spend / metrics.conversions : 0,
      };

      meta.googleAds.metrics = metricsObj;
      meta.googleAds.lastMetricsPull = new Date().toISOString();

      await prisma.campaign.update({
        where: { id: localCampaignId },
        data: { metadata: JSON.stringify(meta) },
      });

      console.log(JSON.stringify({ campaignId: localCampaignId, metrics: metricsObj }, null, 2));
      break;
    }

    default:
      console.error(
        "Usage: npx tsx scripts/google-ads-client.ts <command>\n\n" +
        "Connection:\n" +
        "  check-connection                Test API connectivity\n" +
        "  list-accounts                   Show account info\n\n" +
        "Campaigns:\n" +
        "  list-campaigns                  List all campaigns\n" +
        "  create-campaign                 Create campaign (--name, --budget, --bidStrategy)\n" +
        "  update-campaign-status          Update status (--resourceName, --status)\n\n" +
        "Ad Groups:\n" +
        "  list-ad-groups                  List ad groups (--campaignId)\n" +
        "  create-ad-group                 Create ad group (--campaignId, --name)\n\n" +
        "Ads:\n" +
        "  create-search-ad                Create RSA (--adGroupId, --headlines, --descriptions, --finalUrl)\n\n" +
        "Keywords:\n" +
        "  add-keywords                    Add keywords (--adGroupId, --keywords)\n" +
        "  add-negative-keywords           Add negatives (--campaignId, --keywords)\n\n" +
        "Reports:\n" +
        "  campaign-performance            Campaign metrics (--startDate, --endDate)\n" +
        "  ad-group-performance            Ad group metrics (--campaignId, --startDate, --endDate)\n" +
        "  keyword-performance             Keyword metrics (--campaignId, --startDate, --endDate)\n" +
        "  search-terms                    Search terms (--campaignId, --startDate, --endDate)\n\n" +
        "Sync:\n" +
        "  sync-push                       Push to Google Ads (--campaignId)\n" +
        "  sync-pull                       Pull from Google Ads (--googleCampaignId, --localCampaignId)\n" +
        "  pull-metrics                    Pull metrics (--localCampaignId, --startDate, --endDate)\n"
      );
      process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
