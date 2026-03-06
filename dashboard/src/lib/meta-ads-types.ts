/**
 * TypeScript interfaces for Meta Marketing API data structures.
 * Used by both the dashboard lib and CLI scripts.
 *
 * Meta Marketing API v21 reference:
 * https://developers.facebook.com/docs/marketing-api/reference
 */

// --- Campaigns ---

export interface MetaAdsCampaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  stopTime?: string;
}

// --- Ad Sets ---

export interface MetaAdsAdSet {
  id: string;
  name: string;
  campaignId: string;
  status: string;
  targeting: Record<string, unknown>;
  dailyBudget?: number;
  bidStrategy?: string;
  optimizationGoal?: string;
}

// --- Ads ---

export interface MetaAdsAd {
  id: string;
  name: string;
  adSetId: string;
  status: string;
  creative: {
    title?: string;
    body?: string;
    imageUrl?: string;
    callToAction?: string;
    linkUrl?: string;
  };
}

// --- Insights ---

export interface MetaAdsInsight {
  campaignId?: string;
  adSetId?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  conversions: number;
  costPerConversion: number;
  cpm: number;
  reach: number;
  frequency: number;
  dateStart: string;
  dateStop: string;
}

// --- Account ---

export interface MetaAdsAccountInfo {
  accountId: string;
  name: string;
  currency: string;
  timezone: string;
  businessName?: string;
}

// --- Create Configs ---

export interface CampaignCreateConfig {
  name: string;
  objective:
    | "OUTCOME_LEADS"
    | "OUTCOME_TRAFFIC"
    | "OUTCOME_AWARENESS"
    | "OUTCOME_ENGAGEMENT"
    | "OUTCOME_SALES";
  status?: "PAUSED" | "ACTIVE";
  specialAdCategories?: string[];
}

export interface AdSetCreateConfig {
  name: string;
  campaignId: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  endTime?: string;
  bidStrategy?: string;
  optimizationGoal?: string;
  targeting: {
    geoLocations?: {
      countries?: string[];
      cities?: Array<{ key: string }>;
    };
    ageMin?: number;
    ageMax?: number;
    genders?: number[];
    interests?: Array<{ id: string; name: string }>;
    behaviors?: Array<{ id: string; name: string }>;
    industries?: Array<{ id: string; name: string }>;
    jobTitles?: Array<{ id: string; name: string }>;
  };
}

export interface AdCreateConfig {
  name: string;
  adSetId: string;
  creative: {
    name: string;
    pageId: string;
    title?: string;
    body: string;
    imageHash?: string;
    linkUrl: string;
    callToAction: string;
  };
  status?: "PAUSED" | "ACTIVE";
}

// --- Sync Metadata ---

export interface MetaAdsSyncMeta {
  metaAds?: {
    campaignId?: string;
    adSetIds?: string[];
    status?: string;
    syncedAt?: string;
    lastMetricsPull?: string;
    metrics?: MetaAdsInsight;
  };
}

// --- Shared ---

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;
}
