/**
 * Google Ads API client for the CMO Dashboard.
 * Server-side only. Credentials must never be exposed to the browser.
 *
 * Uses Google Ads REST API v18 via fetch() -- no npm SDK required.
 * Follows the same pattern as postiz.ts.
 */

import {
  fromMicros,
  toMicros,
  type GoogleAdsCampaign,
  type GoogleAdsAdGroup,
  type GoogleAdsAccountInfo,
  type CampaignConfig,
  type AdGroupConfig,
  type RSAConfig,
  type KeywordConfig,
  type CampaignMetrics,
  type AdGroupMetrics,
  type KeywordMetrics,
  type SearchTermRow,
  type PerformanceReport,
  type DateRange,
} from "./google-ads-types";

// --- Configuration ---

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;
const LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

const API_BASE = "https://googleads.googleapis.com/v18";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

// --- Token Management ---

let cachedAccessToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error(
      "Google Ads OAuth credentials not configured. Set GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_REFRESH_TOKEN in .env"
    );
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
  if (data.error) {
    throw new Error(`OAuth token error: ${data.error} -- ${data.error_description}`);
  }

  cachedAccessToken = data.access_token;
  // Expire 60 seconds early to avoid edge cases
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return data.access_token;
}

// --- Core API ---

async function googleAdsFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (!DEVELOPER_TOKEN || !CUSTOMER_ID) {
    throw new Error(
      "Google Ads API not configured. Set GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_CUSTOMER_ID in .env"
    );
  }

  const accessToken = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": DEVELOPER_TOKEN,
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (LOGIN_CUSTOMER_ID) {
    headers["login-customer-id"] = LOGIN_CUSTOMER_ID;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Ads API error (${res.status}): ${errText}`);
  }

  return res.json() as Promise<T>;
}

/** Execute a GAQL query via searchStream */
async function query(gaql: string): Promise<Record<string, unknown>[]> {
  const data = await googleAdsFetch<Array<{ results?: Record<string, unknown>[] }>>(
    `/customers/${CUSTOMER_ID}/googleAds:searchStream`,
    {
      method: "POST",
      body: JSON.stringify({ query: gaql }),
    }
  );

  // searchStream returns an array of result batches
  const results: Record<string, unknown>[] = [];
  for (const batch of data) {
    if (batch.results) {
      results.push(...batch.results);
    }
  }
  return results;
}

/** Execute a mutate operation */
async function mutate(
  resource: string,
  operations: Record<string, unknown>[]
): Promise<Record<string, unknown>> {
  return googleAdsFetch(`/customers/${CUSTOMER_ID}/${resource}:mutate`, {
    method: "POST",
    body: JSON.stringify({ operations }),
  });
}

// --- Connection ---

export async function checkConnection(): Promise<boolean> {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !DEVELOPER_TOKEN || !CUSTOMER_ID) {
      return false;
    }
    await getAccessToken();
    await query("SELECT customer.id FROM customer LIMIT 1");
    return true;
  } catch {
    return false;
  }
}

export async function getAccountInfo(): Promise<GoogleAdsAccountInfo> {
  const results = await query(
    "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1"
  );

  const customer = results[0]?.customer as Record<string, string> | undefined;
  if (!customer) throw new Error("Could not retrieve account info");

  return {
    customerId: customer.id,
    descriptiveName: customer.descriptiveName,
    currencyCode: customer.currencyCode,
    timeZone: customer.timeZone,
  };
}

// --- Campaigns ---

export async function listCampaigns(): Promise<GoogleAdsCampaign[]> {
  const results = await query(`
    SELECT
      campaign.resource_name,
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.start_date,
      campaign.end_date,
      campaign_budget.resource_name,
      campaign_budget.amount_micros,
      campaign.bidding_strategy_type
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.name
  `);

  return results.map((r) => {
    const c = r.campaign as Record<string, string>;
    const b = r.campaignBudget as Record<string, string> | undefined;
    return {
      resourceName: c.resourceName,
      id: c.id,
      name: c.name,
      status: c.status as GoogleAdsCampaign["status"],
      advertisingChannelType: c.advertisingChannelType as GoogleAdsCampaign["advertisingChannelType"],
      startDate: c.startDate,
      endDate: c.endDate,
      budget: b ? { resourceName: b.resourceName, amountMicros: b.amountMicros } : undefined,
      biddingStrategyType: c.biddingStrategyType,
    };
  });
}

export async function createCampaign(config: CampaignConfig): Promise<string> {
  // Step 1: Create budget
  const budgetResult = await mutate("campaignBudgets", [
    {
      create: {
        name: `${config.name} Budget`,
        amountMicros: toMicros(config.budgetAmountUsd).toString(),
        deliveryMethod: "STANDARD",
      },
    },
  ]);

  const budgetResourceName = (budgetResult as { results: Array<{ resourceName: string }> })
    .results[0].resourceName;

  // Step 2: Create campaign (always PAUSED)
  const campaignOp: Record<string, unknown> = {
    create: {
      name: config.name,
      status: "PAUSED",
      advertisingChannelType: config.advertisingChannelType,
      campaignBudget: budgetResourceName,
      startDate: config.startDate?.replace(/-/g, "") || undefined,
      endDate: config.endDate?.replace(/-/g, "") || undefined,
    },
  };

  // Set bidding strategy
  const create = campaignOp.create as Record<string, unknown>;
  switch (config.biddingStrategy) {
    case "MAXIMIZE_CONVERSIONS":
      create.maximizeConversions = {};
      break;
    case "TARGET_CPA":
      create.maximizeConversions = {
        targetCpaMicros: config.targetCpaMicros?.toString(),
      };
      break;
    case "TARGET_ROAS":
      create.maximizeConversionValue = {
        targetRoas: config.targetRoas,
      };
      break;
    case "MANUAL_CPC":
      create.manualCpc = { enhancedCpcEnabled: true };
      break;
  }

  const result = await mutate("campaigns", [campaignOp]);
  return (result as { results: Array<{ resourceName: string }> }).results[0].resourceName;
}

export async function updateCampaignStatus(
  resourceName: string,
  status: "ENABLED" | "PAUSED" | "REMOVED"
): Promise<void> {
  await mutate("campaigns", [
    {
      update: { resourceName, status },
      updateMask: "status",
    },
  ]);
}

// --- Ad Groups ---

export async function listAdGroups(campaignId: string): Promise<GoogleAdsAdGroup[]> {
  const results = await query(`
    SELECT
      ad_group.resource_name,
      ad_group.id,
      ad_group.name,
      ad_group.campaign,
      ad_group.status,
      ad_group.type,
      ad_group.cpc_bid_micros
    FROM ad_group
    WHERE campaign.id = ${campaignId}
      AND ad_group.status != 'REMOVED'
    ORDER BY ad_group.name
  `);

  return results.map((r) => {
    const ag = r.adGroup as Record<string, string>;
    return {
      resourceName: ag.resourceName,
      id: ag.id,
      name: ag.name,
      campaignId,
      status: ag.status as GoogleAdsAdGroup["status"],
      type: ag.type,
      cpcBidMicros: ag.cpcBidMicros,
    };
  });
}

export async function createAdGroup(config: AdGroupConfig): Promise<string> {
  const op: Record<string, unknown> = {
    create: {
      name: config.name,
      campaign: config.campaignResourceName,
      type: config.type,
      status: "ENABLED",
      cpcBidMicros: config.cpcBidMicros?.toString(),
    },
  };

  const result = await mutate("adGroups", [op]);
  return (result as { results: Array<{ resourceName: string }> }).results[0].resourceName;
}

// --- Ads ---

export async function createResponsiveSearchAd(config: RSAConfig): Promise<string> {
  const ad: Record<string, unknown> = {
    responsiveSearchAd: {
      headlines: config.headlines.map((text, i) => ({
        text,
        pinnedField: i < 3 ? undefined : undefined, // no pinning by default
      })),
      descriptions: config.descriptions.map((text) => ({ text })),
      path1: config.path1,
      path2: config.path2,
    },
    finalUrls: [config.finalUrl],
  };

  const result = await mutate("adGroupAds", [
    {
      create: {
        adGroup: config.adGroupResourceName,
        ad,
        status: "ENABLED",
      },
    },
  ]);

  return (result as { results: Array<{ resourceName: string }> }).results[0].resourceName;
}

// --- Keywords ---

export async function addKeywords(
  adGroupResourceName: string,
  keywords: KeywordConfig[]
): Promise<string[]> {
  const operations = keywords.map((kw) => ({
    create: {
      adGroup: adGroupResourceName,
      keyword: {
        text: kw.keyword,
        matchType: kw.matchType,
      },
      status: "ENABLED",
      cpcBidMicros: kw.bidMicros?.toString(),
    },
  }));

  const result = await mutate("adGroupCriteria", operations);
  return (result as { results: Array<{ resourceName: string }> }).results.map(
    (r) => r.resourceName
  );
}

export async function addNegativeKeywords(
  campaignResourceName: string,
  keywords: string[]
): Promise<string[]> {
  const operations = keywords.map((kw) => ({
    create: {
      campaign: campaignResourceName,
      keyword: {
        text: kw,
        matchType: "BROAD",
      },
      negative: true,
    },
  }));

  const result = await mutate("campaignCriteria", operations);
  return (result as { results: Array<{ resourceName: string }> }).results.map(
    (r) => r.resourceName
  );
}

// --- Reporting ---

export async function getCampaignMetrics(dateRange: DateRange): Promise<CampaignMetrics[]> {
  const results = await query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_per_conversion
    FROM campaign
    WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `);

  return results.map((r) => {
    const c = r.campaign as Record<string, string>;
    const m = r.metrics as Record<string, string | number>;
    return {
      campaignId: c.id,
      campaignName: c.name,
      status: c.status,
      impressions: Number(m.impressions) || 0,
      clicks: Number(m.clicks) || 0,
      ctr: Number(m.ctr) || 0,
      averageCpc: fromMicros(m.averageCpc || 0),
      spend: fromMicros(m.costMicros || 0),
      conversions: Number(m.conversions) || 0,
      conversionValue: Number(m.conversionsValue) || 0,
      costPerConversion: fromMicros(m.costPerConversion || 0),
    };
  });
}

export async function getAdGroupMetrics(
  campaignId: string,
  dateRange: DateRange
): Promise<AdGroupMetrics[]> {
  const results = await query(`
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions,
      metrics.cost_per_conversion
    FROM ad_group
    WHERE campaign.id = ${campaignId}
      AND segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
      AND ad_group.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `);

  return results.map((r) => {
    const ag = r.adGroup as Record<string, string>;
    const m = r.metrics as Record<string, string | number>;
    return {
      adGroupId: ag.id,
      adGroupName: ag.name,
      status: ag.status,
      impressions: Number(m.impressions) || 0,
      clicks: Number(m.clicks) || 0,
      ctr: Number(m.ctr) || 0,
      averageCpc: fromMicros(m.averageCpc || 0),
      spend: fromMicros(m.costMicros || 0),
      conversions: Number(m.conversions) || 0,
      costPerConversion: fromMicros(m.costPerConversion || 0),
    };
  });
}

export async function getKeywordPerformance(
  campaignId: string,
  dateRange: DateRange
): Promise<KeywordMetrics[]> {
  const results = await query(`
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions
    FROM keyword_view
    WHERE campaign.id = ${campaignId}
      AND segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
    ORDER BY metrics.impressions DESC
    LIMIT 100
  `);

  return results.map((r) => {
    const kw = r.adGroupCriterion as { keyword: Record<string, string> };
    const m = r.metrics as Record<string, string | number>;
    return {
      keyword: kw.keyword.text,
      matchType: kw.keyword.matchType,
      impressions: Number(m.impressions) || 0,
      clicks: Number(m.clicks) || 0,
      ctr: Number(m.ctr) || 0,
      averageCpc: fromMicros(m.averageCpc || 0),
      spend: fromMicros(m.costMicros || 0),
      conversions: Number(m.conversions) || 0,
    };
  });
}

export async function getSearchTermReport(
  campaignId: string,
  dateRange: DateRange
): Promise<SearchTermRow[]> {
  const results = await query(`
    SELECT
      search_term_view.search_term,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM search_term_view
    WHERE campaign.id = ${campaignId}
      AND segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
    ORDER BY metrics.impressions DESC
    LIMIT 100
  `);

  return results.map((r) => {
    const st = r.searchTermView as Record<string, string>;
    const m = r.metrics as Record<string, string | number>;
    return {
      searchTerm: st.searchTerm,
      impressions: Number(m.impressions) || 0,
      clicks: Number(m.clicks) || 0,
      spend: fromMicros(m.costMicros || 0),
      conversions: Number(m.conversions) || 0,
    };
  });
}

export async function getAccountPerformance(dateRange: DateRange): Promise<PerformanceReport> {
  const campaigns = await getCampaignMetrics(dateRange);

  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + c.conversions,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  return {
    dateRange: { start: dateRange.start, end: dateRange.end },
    campaigns,
    totals: {
      ...totals,
      ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
      averageCpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
      averageRoas: 0, // calculated when conversion value is available
    },
  };
}

// Re-export types for convenience
export type {
  GoogleAdsCampaign,
  GoogleAdsAdGroup,
  GoogleAdsAccountInfo,
  CampaignConfig,
  AdGroupConfig,
  RSAConfig,
  KeywordConfig,
  CampaignMetrics,
  AdGroupMetrics,
  KeywordMetrics,
  SearchTermRow,
  PerformanceReport,
  DateRange,
  GoogleAdsSyncMeta,
} from "./google-ads-types";
