/**
 * Meta Marketing API v21 client for the CMO Dashboard.
 * Server-side only. Credentials must never be exposed to the browser.
 *
 * Uses Meta Graph API REST via fetch() -- no npm SDK required.
 * Auth: access_token passed as query parameter on every request.
 * Follows the same pattern as google-ads.ts and postiz.ts.
 */

import type {
  MetaAdsCampaign,
  MetaAdsAdSet,
  MetaAdsAd,
  MetaAdsInsight,
  MetaAdsAccountInfo,
  CampaignCreateConfig,
  AdSetCreateConfig,
  AdCreateConfig,
  DateRange,
} from "./meta-ads-types";

// --- Configuration ---

const APP_ID = process.env.META_APP_ID;
const APP_SECRET = process.env.META_APP_SECRET;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID;

const API_BASE = "https://graph.facebook.com/v21.0";

// --- Core API ---

async function metaFetch<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  if (!ACCESS_TOKEN || !AD_ACCOUNT_ID) {
    throw new Error(
      "Meta Ads API not configured. Set META_ACCESS_TOKEN and META_AD_ACCOUNT_ID in .env"
    );
  }

  const url = new URL(
    endpoint.startsWith("http") ? endpoint : `${API_BASE}/${endpoint}`
  );

  // Auth is always passed as a query param per the Meta Marketing API spec
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
    cache: "no-store",
  });

  const data = await res.json();

  // Meta returns errors in a top-level `error` object even on 200 responses
  if (data.error) {
    throw new Error(
      `Meta Ads API error (${data.error.code}): ${data.error.message} [type: ${data.error.type}]`
    );
  }

  if (!res.ok) {
    throw new Error(`Meta Ads API HTTP error (${res.status}): ${JSON.stringify(data)}`);
  }

  return data as T;
}

/** Convenience wrapper for account-scoped endpoints: act_{AD_ACCOUNT_ID}/{path} */
function accountEndpoint(path: string): string {
  return `act_${AD_ACCOUNT_ID}/${path}`;
}

// --- Connection ---

export async function checkConnection(): Promise<boolean> {
  try {
    if (!ACCESS_TOKEN || !AD_ACCOUNT_ID) return false;
    // A minimal read of the ad account itself is the cheapest possible check
    await metaFetch<{ id: string }>(`act_${AD_ACCOUNT_ID}`, {
      params: { fields: "id" },
    });
    return true;
  } catch {
    return false;
  }
}

export async function getAccountInfo(): Promise<MetaAdsAccountInfo> {
  const data = await metaFetch<{
    id: string;
    name: string;
    currency: string;
    timezone_name: string;
    business?: { name: string };
  }>(`act_${AD_ACCOUNT_ID}`, {
    params: { fields: "id,name,currency,timezone_name,business" },
  });

  return {
    accountId: data.id.replace("act_", ""),
    name: data.name,
    currency: data.currency,
    timezone: data.timezone_name,
    businessName: data.business?.name,
  };
}

// --- Campaigns ---

export async function listCampaigns(): Promise<MetaAdsCampaign[]> {
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

  return data.data.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status as MetaAdsCampaign["status"],
    objective: c.objective,
    dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : undefined,
    lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : undefined,
    startTime: c.start_time,
    stopTime: c.stop_time,
  }));
}

export async function createCampaign(config: CampaignCreateConfig): Promise<string> {
  const body: Record<string, unknown> = {
    name: config.name,
    objective: config.objective,
    status: config.status ?? "PAUSED",
    special_ad_categories: config.specialAdCategories ?? [],
  };

  const data = await metaFetch<{ id: string }>(accountEndpoint("campaigns"), {
    method: "POST",
    body: JSON.stringify(body),
  });

  return data.id;
}

export async function updateCampaignStatus(
  campaignId: string,
  status: "ACTIVE" | "PAUSED" | "DELETED"
): Promise<void> {
  await metaFetch<{ success: boolean }>(`${campaignId}`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

// --- Ad Sets ---

export async function listAdSets(campaignId: string): Promise<MetaAdsAdSet[]> {
  const data = await metaFetch<{
    data: Array<{
      id: string;
      name: string;
      campaign_id: string;
      status: string;
      targeting: Record<string, unknown>;
      daily_budget?: string;
      bid_strategy?: string;
      optimization_goal?: string;
    }>;
  }>(accountEndpoint("adsets"), {
    params: {
      fields: "id,name,campaign_id,status,targeting,daily_budget,bid_strategy,optimization_goal",
      campaign_id: campaignId,
      limit: "100",
    },
  });

  return data.data.map((s) => ({
    id: s.id,
    name: s.name,
    campaignId: s.campaign_id,
    status: s.status,
    targeting: s.targeting ?? {},
    dailyBudget: s.daily_budget ? Number(s.daily_budget) / 100 : undefined,
    bidStrategy: s.bid_strategy,
    optimizationGoal: s.optimization_goal,
  }));
}

export async function createAdSet(config: AdSetCreateConfig): Promise<string> {
  // Meta budgets are in cents (USD * 100)
  const body: Record<string, unknown> = {
    name: config.name,
    campaign_id: config.campaignId,
    status: "PAUSED",
    billing_event: "IMPRESSIONS",
    optimization_goal: config.optimizationGoal ?? "LEAD_GENERATION",
    bid_strategy: config.bidStrategy ?? "LOWEST_COST_WITHOUT_CAP",
    targeting: buildTargeting(config.targeting),
  };

  if (config.dailyBudget !== undefined) {
    body.daily_budget = Math.round(config.dailyBudget * 100).toString();
  } else if (config.lifetimeBudget !== undefined) {
    body.lifetime_budget = Math.round(config.lifetimeBudget * 100).toString();
  }

  if (config.startTime) body.start_time = config.startTime;
  if (config.endTime) body.end_time = config.endTime;

  const data = await metaFetch<{ id: string }>(accountEndpoint("adsets"), {
    method: "POST",
    body: JSON.stringify(body),
  });

  return data.id;
}

// --- Ads ---

export async function createAd(config: AdCreateConfig): Promise<string> {
  const { creative } = config;

  // Step 1: Create the ad creative object
  const creativeBody: Record<string, unknown> = {
    name: creative.name,
    object_story_spec: {
      page_id: creative.pageId,
      link_data: {
        message: creative.body,
        link: creative.linkUrl,
        call_to_action: {
          type: creative.callToAction,
          value: { link: creative.linkUrl },
        },
        ...(creative.title ? { name: creative.title } : {}),
        ...(creative.imageHash ? { image_hash: creative.imageHash } : {}),
      },
    },
  };

  const creativeData = await metaFetch<{ id: string }>(
    accountEndpoint("adcreatives"),
    {
      method: "POST",
      body: JSON.stringify(creativeBody),
    }
  );

  // Step 2: Create the ad, referencing the creative
  const adBody: Record<string, unknown> = {
    name: config.name,
    adset_id: config.adSetId,
    creative: { creative_id: creativeData.id },
    status: config.status ?? "PAUSED",
  };

  const adData = await metaFetch<{ id: string }>(accountEndpoint("ads"), {
    method: "POST",
    body: JSON.stringify(adBody),
  });

  return adData.id;
}

export async function listAds(adSetId: string): Promise<MetaAdsAd[]> {
  const data = await metaFetch<{
    data: Array<{
      id: string;
      name: string;
      adset_id: string;
      status: string;
      creative?: {
        title?: string;
        body?: string;
        image_url?: string;
        call_to_action_type?: string;
        link_url?: string;
      };
    }>;
  }>(accountEndpoint("ads"), {
    params: {
      fields: "id,name,adset_id,status,creative{title,body,image_url,call_to_action_type,link_url}",
      adset_id: adSetId,
      limit: "100",
    },
  });

  return data.data.map((a) => ({
    id: a.id,
    name: a.name,
    adSetId: a.adset_id,
    status: a.status,
    creative: {
      title: a.creative?.title,
      body: a.creative?.body,
      imageUrl: a.creative?.image_url,
      callToAction: a.creative?.call_to_action_type,
      linkUrl: a.creative?.link_url,
    },
  }));
}

// --- Insights / Reporting ---

export async function getCampaignInsights(
  campaignId: string,
  dateRange: DateRange
): Promise<MetaAdsInsight> {
  const timeRange = JSON.stringify({ since: dateRange.start, until: dateRange.end });

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
      fields:
        "impressions,clicks,ctr,spend,actions,cost_per_action_type,cpm,reach,frequency",
      time_range: timeRange,
      level: "campaign",
    },
  });

  const row = data.data[0];
  if (!row) {
    // Return zeroed insight if no data in range
    return {
      campaignId,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      spend: 0,
      conversions: 0,
      costPerConversion: 0,
      cpm: 0,
      reach: 0,
      frequency: 0,
      dateStart: dateRange.start,
      dateStop: dateRange.end,
    };
  }

  const conversions = extractActionValue(row.actions, "lead") +
    extractActionValue(row.actions, "complete_registration") +
    extractActionValue(row.actions, "offsite_conversion.fb_pixel_lead");

  const costPerConversion = extractActionValue(row.cost_per_action_type, "lead") ||
    extractActionValue(row.cost_per_action_type, "complete_registration") ||
    0;

  return {
    campaignId,
    impressions: Number(row.impressions) || 0,
    clicks: Number(row.clicks) || 0,
    ctr: Number(row.ctr) || 0,
    spend: Number(row.spend) || 0,
    conversions,
    costPerConversion,
    cpm: Number(row.cpm) || 0,
    reach: Number(row.reach) || 0,
    frequency: Number(row.frequency) || 0,
    dateStart: row.date_start,
    dateStop: row.date_stop,
  };
}

export async function getAccountInsights(dateRange: DateRange): Promise<MetaAdsInsight[]> {
  const timeRange = JSON.stringify({ since: dateRange.start, until: dateRange.end });

  const data = await metaFetch<{
    data: Array<{
      campaign_id?: string;
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
  }>(accountEndpoint("insights"), {
    params: {
      fields:
        "campaign_id,impressions,clicks,ctr,spend,actions,cost_per_action_type,cpm,reach,frequency",
      time_range: timeRange,
      level: "campaign",
      limit: "100",
    },
  });

  return data.data.map((row) => {
    const conversions =
      extractActionValue(row.actions, "lead") +
      extractActionValue(row.actions, "complete_registration") +
      extractActionValue(row.actions, "offsite_conversion.fb_pixel_lead");

    const costPerConversion =
      extractActionValue(row.cost_per_action_type, "lead") ||
      extractActionValue(row.cost_per_action_type, "complete_registration") ||
      0;

    return {
      campaignId: row.campaign_id,
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.clicks) || 0,
      ctr: Number(row.ctr) || 0,
      spend: Number(row.spend) || 0,
      conversions,
      costPerConversion,
      cpm: Number(row.cpm) || 0,
      reach: Number(row.reach) || 0,
      frequency: Number(row.frequency) || 0,
      dateStart: row.date_start,
      dateStop: row.date_stop,
    };
  });
}

// --- Internal Helpers ---

/**
 * Extract numeric value from a Meta actions/cost_per_action_type array by action_type string.
 * Meta returns partial matches, e.g. "lead" matches both "lead" and "offsite_conversion.fb_pixel_lead".
 */
function extractActionValue(
  actions: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!actions) return 0;
  const match = actions.find((a) => a.action_type === actionType);
  return match ? Number(match.value) || 0 : 0;
}

/**
 * Convert our AdSetCreateConfig.targeting into the Meta targeting spec format.
 * Reference: https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-specs
 */
function buildTargeting(targeting: AdSetCreateConfig["targeting"]): Record<string, unknown> {
  const spec: Record<string, unknown> = {};

  if (targeting.geoLocations) {
    spec.geo_locations = {
      ...(targeting.geoLocations.countries
        ? { countries: targeting.geoLocations.countries }
        : {}),
      ...(targeting.geoLocations.cities
        ? { cities: targeting.geoLocations.cities }
        : {}),
    };
  } else {
    // Default to US if no location specified
    spec.geo_locations = { countries: ["US"] };
  }

  if (targeting.ageMin !== undefined) spec.age_min = targeting.ageMin;
  if (targeting.ageMax !== undefined) spec.age_max = targeting.ageMax;
  if (targeting.genders !== undefined) spec.genders = targeting.genders;

  if (targeting.interests && targeting.interests.length > 0) {
    spec.interests = targeting.interests.map((i) => ({ id: i.id, name: i.name }));
  }

  if (targeting.behaviors && targeting.behaviors.length > 0) {
    spec.behaviors = targeting.behaviors.map((b) => ({ id: b.id, name: b.name }));
  }

  // Industries and job titles map to Meta's work_employers / work_positions
  // These are passed as flexible_spec interest arrays in practice
  const flexSpec: Array<Record<string, unknown>> = [];

  if (targeting.industries && targeting.industries.length > 0) {
    flexSpec.push({
      industries: targeting.industries.map((i) => ({ id: i.id, name: i.name })),
    });
  }

  if (targeting.jobTitles && targeting.jobTitles.length > 0) {
    flexSpec.push({
      work_positions: targeting.jobTitles.map((j) => ({ id: j.id, name: j.name })),
    });
  }

  if (flexSpec.length > 0) spec.flexible_spec = flexSpec;

  return spec;
}

// Re-export types for convenience
export type {
  MetaAdsCampaign,
  MetaAdsAdSet,
  MetaAdsAd,
  MetaAdsInsight,
  MetaAdsAccountInfo,
  CampaignCreateConfig,
  AdSetCreateConfig,
  AdCreateConfig,
  DateRange,
  MetaAdsSyncMeta,
} from "./meta-ads-types";
