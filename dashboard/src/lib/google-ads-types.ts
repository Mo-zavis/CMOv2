/**
 * TypeScript interfaces for Google Ads API data structures.
 * Used by both the dashboard lib and CLI scripts.
 */

// --- Monetary helpers ---

/** Convert USD to Google Ads micros (1 USD = 1,000,000 micros) */
export function toMicros(usd: number): number {
  return Math.round(usd * 1_000_000);
}

/** Convert Google Ads micros to USD */
export function fromMicros(micros: string | number): number {
  return Number(micros) / 1_000_000;
}

// --- Campaign ---

export interface GoogleAdsCampaign {
  resourceName: string;
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED" | "UNKNOWN";
  advertisingChannelType: "SEARCH" | "DISPLAY" | "VIDEO" | "SHOPPING" | "PERFORMANCE_MAX";
  startDate?: string;
  endDate?: string;
  budget?: {
    resourceName: string;
    amountMicros: string;
  };
  biddingStrategyType?: string;
}

export interface CampaignConfig {
  name: string;
  budgetAmountUsd: number;
  advertisingChannelType: "SEARCH" | "DISPLAY" | "VIDEO";
  biddingStrategy: "MAXIMIZE_CONVERSIONS" | "TARGET_CPA" | "TARGET_ROAS" | "MANUAL_CPC";
  targetCpaMicros?: number;
  targetRoas?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
}

// --- Ad Group ---

export interface GoogleAdsAdGroup {
  resourceName: string;
  id: string;
  name: string;
  campaignId: string;
  status: "ENABLED" | "PAUSED" | "REMOVED" | "UNKNOWN";
  type: string;
  cpcBidMicros?: string;
}

export interface AdGroupConfig {
  campaignResourceName: string;
  name: string;
  type: "SEARCH_STANDARD" | "DISPLAY_STANDARD" | "VIDEO_RESPONSIVE";
  cpcBidMicros?: number;
}

// --- Ad ---

export interface RSAConfig {
  adGroupResourceName: string;
  headlines: string[]; // up to 15
  descriptions: string[]; // up to 4
  finalUrl: string;
  path1?: string;
  path2?: string;
}

// --- Keywords ---

export interface KeywordConfig {
  keyword: string;
  matchType: "EXACT" | "PHRASE" | "BROAD";
  bidMicros?: number;
}

// --- Metrics ---

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  status: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  costPerConversion: number;
}

export interface AdGroupMetrics {
  adGroupId: string;
  adGroupName: string;
  status: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  spend: number;
  conversions: number;
  costPerConversion: number;
}

export interface KeywordMetrics {
  keyword: string;
  matchType: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  spend: number;
  conversions: number;
}

export interface SearchTermRow {
  searchTerm: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface PerformanceReport {
  dateRange: { start: string; end: string };
  campaigns: CampaignMetrics[];
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    averageCpa: number;
    averageRoas: number;
  };
}

// --- Account ---

export interface GoogleAdsAccountInfo {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
}

// --- Sync metadata stored in Campaign/AdGroup/AdCreative JSON ---

export interface GoogleAdsSyncMeta {
  resourceName: string;
  googleId: string;
  status: string;
  syncedAt: string;
  lastMetricsPull?: string;
  metrics?: {
    dateRange: { start: string; end: string };
    impressions: number;
    clicks: number;
    ctr: number;
    averageCpc: number;
    spend: number;
    conversions: number;
    costPerConversion: number;
    conversionValue?: number;
  };
}

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;
}
