"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

// --- Types ---

interface LinkedAsset {
  id: string;
  title: string;
  type: string;
  status: string;
  platform: string | null;
  versions: {
    filePath: string | null;
    content: string | null;
    metadata: string | null;
  }[];
}

interface Creative {
  id: string;
  headline: string;
  description: string | null;
  cta: string | null;
  landingUrl: string | null;
  format: string;
  utmParams: string | null;
  imageAssetId: string | null;
  copyAssetId: string | null;
  metadata: string | null;
  status: string;
  linkedImage: LinkedAsset | null;
  linkedCopy: LinkedAsset | null;
}

interface AdGroupData {
  id: string;
  name: string;
  platform: string;
  adType: string;
  targeting: string | null;
  keywords: string | null;
  budget: number | null;
  bidStrategy: string | null;
  status: string;
  creatives: Creative[];
}

interface CampaignAsset {
  id: string;
  type: string;
  title: string;
  status: string;
  platform: string | null;
  currentVersion: number;
  versions: {
    filePath: string | null;
    content: string | null;
    metadata: string | null;
  }[];
}

interface CampaignData {
  id: string;
  name: string;
  objective: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  pillar: string | null;
  targeting: string | null;
  channels: string | null;
  kpis: string | null;
  metadata: string | null;
  assets: CampaignAsset[];
  adGroups: AdGroupData[];
  northStarTarget?: number | null;
  northStarActual?: number | null;
}

interface TargetingData {
  locations?: string[];
  age_range?: [string, string];
  gender?: string;
  job_titles?: string[];
  industries?: string[];
  audience_segments?: string[];
  languages?: string[];
}

interface GroupTargetingData {
  audience_type?: string;
  seniority?: string[];
  company_size?: string[];
  placements?: string[];
  exclusions?: string[];
}

interface KpiData {
  [key: string]: unknown;
}

interface KeywordData {
  keyword: string;
  matchType: string;
  bid?: number;
}

interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

interface ResearchArtifact {
  id: string;
  artifactType: string;
  title: string;
  data: string;
  source: string | null;
  createdAt: string;
}

interface MetricSnapshot {
  id: string;
  channel: string;
  metricType: string;
  value: number;
  period: string;
  recordedAt: string;
  metadata: string | null;
}

interface OptimizationDecision {
  id: string;
  decisionType: string;
  rationale: string;
  before: string;
  after: string;
  impact: string | null;
  status: string;
  createdAt: string;
}

// --- Platform specs ---

const PLATFORM_SPECS: Record<
  string,
  Record<string, { label: string; specs: string[] }>
> = {
  google_ads: {
    search: {
      label: "Responsive Search Ad",
      specs: [
        "Up to 15 headlines (max 30 chars each)",
        "Up to 4 descriptions (max 90 chars each)",
        "Auto-combined by Google for best performance",
      ],
    },
    display: {
      label: "Display Network",
      specs: [
        "Sizes: 300x250, 728x90, 336x280, 970x250, 320x50",
        "Image + headline + description + CTA",
        "Max 150KB per image",
      ],
    },
    video: {
      label: "YouTube Pre-Roll",
      specs: [
        "15s or 30s variants",
        "16:9 landscape",
        "Companion banner: 300x60",
      ],
    },
  },
  meta_ads: {
    feed: {
      label: "Feed Ad",
      specs: [
        "Image: 1080x1350 (4:5 recommended)",
        "Primary text max 125 chars",
        "Headline max 40 chars",
        "Text < 20% of image area",
      ],
    },
    stories: {
      label: "Stories / Reels",
      specs: [
        "9:16 full screen (1080x1920)",
        "Swipe-up CTA area at bottom 15%",
        "Max 15s video or static image",
      ],
    },
    reels: {
      label: "Reels",
      specs: [
        "9:16 vertical (1080x1920)",
        "Max 60s video",
        "Sound-on design recommended",
      ],
    },
  },
  linkedin_ads: {
    feed: {
      label: "Sponsored Content",
      specs: [
        "Image: 1200x628 or 1080x1080",
        "Introductory text max 150 chars",
        "Headline max 70 chars",
        "CTA button from LinkedIn options",
      ],
    },
  },
};

// --- Helpers ---

function safeParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function getModelName(metadata: string | null): string | null {
  const m = safeParse<Record<string, unknown>>(metadata);
  if (!m) return null;
  const raw = m.model || m.model_name || m.generationModel;
  return raw ? String(raw) : null;
}

const TYPE_ROUTES: Record<string, string> = {
  image: "/images",
  copy: "/content",
  video: "/videos",
  ad_creative: "/ads/creatives",
  social_post: "/social",
  email: "/emails",
};

const TAB_ITEMS = [
  { value: "overview", label: "Overview", step: 1 },
  { value: "research", label: "Research", step: 2 },
  { value: "assets", label: "Assets", step: 3 },
  { value: "distribution", label: "Distribution", step: 4 },
  { value: "tracking", label: "Tracking", step: 5 },
  { value: "optimize", label: "Optimize", step: 6 },
];

// --- Component ---

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [research, setResearch] = useState<ResearchArtifact[]>([]);
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationDecision[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchCampaign = useCallback(async () => {
    const res = await fetchAPI(`/api/campaigns/${id}`);
    if (res.ok) {
      setCampaign(await res.json());
    }
  }, [id]);

  const fetchResearch = useCallback(async () => {
    try {
      const res = await fetchAPI(`/api/research?campaignId=${id}`);
      if (res.ok) setResearch(await res.json());
    } catch {
      /* empty is fine */
    }
  }, [id]);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetchAPI(`/api/metrics?campaignId=${id}`);
      if (res.ok) setMetrics(await res.json());
    } catch {
      /* empty is fine */
    }
  }, [id]);

  const fetchOptimizations = useCallback(async () => {
    try {
      const res = await fetchAPI(`/api/optimizations?campaignId=${id}`);
      if (res.ok) setOptimizations(await res.json());
    } catch {
      /* empty is fine */
    }
  }, [id]);

  const handleSync = useCallback(
    async (action: string) => {
      setSyncing(true);
      setSyncMessage(null);
      try {
        const res = await fetch("/api/google-ads/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, campaignId: id }),
        });
        const data = await res.json();
        if (res.ok) {
          setSyncMessage(
            action === "push"
              ? "Pushed to Google Ads"
              : action === "pull"
                ? "Pulled from Google Ads"
                : "Metrics updated"
          );
          fetchCampaign();
        } else {
          setSyncMessage(data.error || "Sync failed");
        }
      } catch {
        setSyncMessage("Sync request failed");
      } finally {
        setSyncing(false);
      }
    },
    [id, fetchCampaign]
  );

  useEffect(() => {
    fetchCampaign();
    fetchResearch();
    fetchMetrics();
    fetchOptimizations();
  }, [fetchCampaign, fetchResearch, fetchMetrics, fetchOptimizations]);

  if (!campaign) {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  const targeting = safeParse<TargetingData>(campaign.targeting);
  const kpis = safeParse<KpiData>(campaign.kpis);
  const channels = safeParse<string[]>(campaign.channels);

  // Find assets not linked to any creative
  const linkedAssetIds = new Set<string>();
  for (const group of campaign.adGroups) {
    for (const creative of group.creatives) {
      if (creative.imageAssetId) linkedAssetIds.add(creative.imageAssetId);
      if (creative.copyAssetId) linkedAssetIds.add(creative.copyAssetId);
    }
  }
  const unlinkedAssets = campaign.assets.filter(
    (a) => !linkedAssetIds.has(a.id)
  );

  // Budget by channel
  const budgetByChannel: Record<string, number> = {};
  for (const group of campaign.adGroups) {
    const ch = group.platform;
    budgetByChannel[ch] = (budgetByChannel[ch] || 0) + (group.budget || 0);
  }

  // Group assets by type
  const assetsByType: Record<string, CampaignAsset[]> = {};
  for (const asset of campaign.assets) {
    if (!assetsByType[asset.type]) assetsByType[asset.type] = [];
    assetsByType[asset.type].push(asset);
  }

  // Group metrics by channel
  const metricsByChannel: Record<string, MetricSnapshot[]> = {};
  for (const m of metrics) {
    if (!metricsByChannel[m.channel]) metricsByChannel[m.channel] = [];
    metricsByChannel[m.channel].push(m);
  }

  // Google Ads metadata
  const meta = safeParse<Record<string, unknown>>(campaign.metadata);
  const gAds = meta?.googleAds as
    | {
        resourceName?: string;
        googleId?: string;
        status?: string;
        syncedAt?: string;
        lastMetricsPull?: string;
        metrics?: {
          impressions: number;
          clicks: number;
          ctr: number;
          spend: number;
          conversions: number;
          costPerConversion: number;
          dateRange?: { start: string; end: string };
        };
      }
    | undefined;

  const hasGoogleAds = campaign.adGroups.some(
    (g) => g.platform === "google_ads"
  );

  return (
    <div className="space-y-8">
      {/* ===== Header (always visible) ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1c]">
            {campaign.name}
          </h2>
          {campaign.objective && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {campaign.objective}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {campaign.pillar && (
            <span className="text-[10px] uppercase tracking-wider bg-[#006828]/10 text-[#006828] px-2.5 py-1 rounded-full font-medium">
              {campaign.pillar.replace(/_/g, " ")}
            </span>
          )}
          <StatusBadge status={campaign.status} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <Card className="p-5 border-[#ecebe8]">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            Budget
          </p>
          <p className="text-xl font-heading font-bold text-[#1c1c1c] mt-1.5">
            {campaign.budget ? `$${campaign.budget.toLocaleString()}` : "---"}
          </p>
        </Card>
        <Card className="p-5 border-[#ecebe8]">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            Timeline
          </p>
          <p className="text-sm font-medium mt-1">
            {campaign.startDate
              ? new Date(campaign.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "---"}
            {campaign.endDate &&
              ` -- ${new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Assets
          </p>
          <p className="text-xl font-heading font-semibold mt-1">
            {campaign.assets.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Ad Groups
          </p>
          <p className="text-xl font-heading font-semibold mt-1">
            {campaign.adGroups.length}
          </p>
        </Card>
      </div>

      {/* ===== Horizontal Tab Bar ===== */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center gap-2">
          <TabsList
            variant="line"
            className="w-full justify-start border-b border-border pb-0 overflow-x-auto"
          >
            {TAB_ITEMS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:text-[#006828] data-[state=active]:after:bg-[#006828] px-3 py-2 text-sm gap-1.5"
              >
                <span className="text-[10px] font-mono opacity-50">
                  {tab.step}
                </span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Cycle indicator */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#006828"
            strokeWidth="1.5"
            className="shrink-0 opacity-40"
            aria-label="Cycle loops back to step 1"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </div>

        {/* ===== Tab 1: Overview ===== */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Objective */}
          {campaign.objective && (
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-2">
                Objective
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {campaign.objective}
              </p>
            </Card>
          )}

          {/* Targeting */}
          {targeting && (
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-3">
                Campaign-Level Audience and Targeting
              </h3>
              <div className="flex flex-wrap gap-4">
                {targeting.locations && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Locations
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {targeting.locations.map((loc) => (
                        <span
                          key={loc}
                          className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded"
                        >
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {targeting.age_range && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Age
                    </p>
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                      {targeting.age_range[0]}--{targeting.age_range[1]}
                    </span>
                  </div>
                )}
                {targeting.job_titles && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Job Titles
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {targeting.job_titles.map((jt) => (
                        <span
                          key={jt}
                          className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded"
                        >
                          {jt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {targeting.industries && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Industries
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {targeting.industries.map((ind) => (
                        <span
                          key={ind}
                          className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {targeting.audience_segments && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Audience Segments
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {targeting.audience_segments.map((seg) => (
                        <span
                          key={seg}
                          className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded"
                        >
                          {seg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {targeting.languages && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Languages
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {targeting.languages.map((lang) => (
                        <span
                          key={lang}
                          className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Channels + KPIs + Budget side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Channels */}
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-3">
                Channels
              </h3>
              {channels && channels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {channels.map((ch) => (
                    <span
                      key={ch}
                      className="text-xs bg-muted text-foreground px-2 py-1 rounded capitalize"
                    >
                      {ch.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No channels configured.
                </p>
              )}
            </Card>

            {/* KPIs */}
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-3">
                Target KPIs
              </h3>
              {kpis ? (
                <div className="space-y-2">
                  {Object.entries(kpis).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-medium font-mono">
                        {typeof value === "number" && key.includes("rate")
                          ? `${value}%`
                          : typeof value === "number" &&
                              (key.includes("cpa") ||
                                key.includes("budget") ||
                                key.includes("cac"))
                            ? `$${value}`
                            : typeof value === "number" && key.includes("roas")
                              ? `${value}x`
                              : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No KPIs configured yet.
                </p>
              )}
            </Card>

            {/* Budget by channel */}
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-3">
                Budget by Channel
              </h3>
              {Object.keys(budgetByChannel).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(budgetByChannel).map(([ch, amount]) => (
                    <div
                      key={ch}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-muted-foreground capitalize">
                        {ch.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-medium font-mono">
                        ${amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Total Allocated</span>
                    <span className="text-xs font-semibold font-mono">
                      $
                      {Object.values(budgetByChannel)
                        .reduce((a, b) => a + b, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  {campaign.budget && (
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Campaign budget</span>
                      <span className="font-mono">
                        ${campaign.budget.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No budget allocated yet.
                </p>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ===== Tab 2: Research ===== */}
        <TabsContent value="research" className="mt-6 space-y-6">
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-4">
              Research Artifacts
            </h3>
            {research.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {research.map((artifact) => {
                  const dataPreview =
                    artifact.data.length > 200
                      ? artifact.data.slice(0, 200) + "..."
                      : artifact.data;
                  return (
                    <Card
                      key={artifact.id}
                      className="p-4 border border-border space-y-2"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase"
                        >
                          {artifact.artifactType.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-sm font-medium">
                          {artifact.title}
                        </span>
                      </div>
                      <pre className="text-[11px] text-muted-foreground bg-muted/50 rounded p-2 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                        {dataPreview}
                      </pre>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        {artifact.source && <span>Source: {artifact.source}</span>}
                        <span>
                          {new Date(artifact.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No research artifacts yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask Claude to research the market, competitors, and audience
                  for this campaign.
                </p>
              </div>
            )}
          </Card>

          {/* Research Briefs placeholder */}
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-2">
              Research Briefs
            </h3>
            <p className="text-xs text-muted-foreground">
              Research briefs will appear here once the planning phase generates
              them.
            </p>
          </Card>
        </TabsContent>

        {/* ===== Tab 3: Assets ===== */}
        <TabsContent value="assets" className="mt-6 space-y-6">
          {/* Assets grouped by type */}
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-4">
              Campaign Assets ({campaign.assets.length})
            </h3>
            {Object.keys(assetsByType).length > 0 ? (
              <div className="space-y-5">
                {Object.entries(assetsByType).map(([type, assets]) => (
                  <div key={type}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                      {type.replace(/_/g, " ")} ({assets.length})
                    </p>
                    <div className="space-y-1">
                      {assets.map((asset) => {
                        const route = TYPE_ROUTES[asset.type] ?? "/library";
                        const model = getModelName(
                          asset.versions[0]?.metadata ?? null
                        );
                        return (
                          <Link key={asset.id} href={`${route}/${asset.id}`}>
                            <Card className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 hover:shadow-sm transition-shadow cursor-pointer">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-sm font-medium truncate">
                                  {asset.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase shrink-0"
                                >
                                  {asset.type.replace(/_/g, " ")}
                                </Badge>
                                {model && (
                                  <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                                    {model}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {asset.platform && (
                                  <span className="text-[10px] text-muted-foreground capitalize">
                                    {asset.platform}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  v{asset.currentVersion}
                                </span>
                                <StatusBadge status={asset.status} />
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No assets linked to this campaign yet.
              </p>
            )}
          </Card>

          {/* Ad Groups with full creative details */}
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-4">
              Ad Groups ({campaign.adGroups.length})
            </h3>

            {campaign.adGroups.length > 0 ? (
              <div className="space-y-4">
                {campaign.adGroups.map((group) => {
                  const groupTargeting = safeParse<GroupTargetingData>(
                    group.targeting
                  );
                  const keywords = safeParse<KeywordData[]>(group.keywords);
                  const specs =
                    PLATFORM_SPECS[group.platform]?.[group.adType] ?? null;

                  return (
                    <Card key={group.id} className="p-0 overflow-hidden border">
                      {/* Identity bar */}
                      <div className="px-4 py-3 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold">
                            {group.name}
                          </h4>
                          <span className="text-[10px] bg-foreground/10 text-foreground px-1.5 py-0.5 rounded uppercase font-medium">
                            {group.platform.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] bg-foreground/10 text-foreground px-1.5 py-0.5 rounded">
                            {group.adType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {group.budget && (
                            <span className="text-xs font-mono font-medium">
                              ${group.budget.toLocaleString()}
                            </span>
                          )}
                          {group.bidStrategy && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                              {group.bidStrategy.replace(/_/g, " ")}
                            </span>
                          )}
                          <StatusBadge status={group.status} />
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Audience */}
                        {groupTargeting && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                              Audience
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {groupTargeting.audience_type && (
                                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-medium">
                                  {groupTargeting.audience_type.replace(
                                    /_/g,
                                    " "
                                  )}
                                </span>
                              )}
                              {groupTargeting.seniority?.map((s) => (
                                <span
                                  key={s}
                                  className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded"
                                >
                                  {s}
                                </span>
                              ))}
                              {groupTargeting.company_size?.map((cs) => (
                                <span
                                  key={cs}
                                  className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded"
                                >
                                  {cs} employees
                                </span>
                              ))}
                              {groupTargeting.placements?.map((p) => (
                                <span
                                  key={p}
                                  className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded"
                                >
                                  {p.replace(/_/g, " ")}
                                </span>
                              ))}
                              {groupTargeting.exclusions?.map((ex) => (
                                <span
                                  key={ex}
                                  className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded line-through"
                                >
                                  {ex.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Keywords */}
                        {keywords && keywords.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                              Keywords
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {keywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-mono"
                                >
                                  {kw.matchType === "exact"
                                    ? `[${kw.keyword}]`
                                    : kw.matchType === "phrase"
                                      ? `"${kw.keyword}"`
                                      : kw.keyword}
                                  {kw.bid && (
                                    <span className="ml-1 text-orange-400">
                                      ${kw.bid}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Platform specs */}
                        {specs && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                              Format Requirements. {specs.label}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                              {specs.specs.map((s) => (
                                <span
                                  key={s}
                                  className="text-[11px] text-muted-foreground"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Creatives */}
                        {group.creatives.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                              Creatives ({group.creatives.length})
                            </p>
                            <div className="space-y-2">
                              {group.creatives.map((creative) => {
                                const utm = safeParse<UtmData>(
                                  creative.utmParams
                                );
                                const imgModel =
                                  creative.linkedImage?.versions[0]?.metadata
                                    ? getModelName(
                                        creative.linkedImage.versions[0]
                                          .metadata
                                      )
                                    : null;

                                return (
                                  <div
                                    key={creative.id}
                                    className="border border-border rounded-md p-3 space-y-2"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium">
                                          {creative.headline}
                                        </span>
                                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                          {creative.format.replace(/_/g, " ")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {creative.cta && (
                                          <span className="text-[10px] bg-[#006828]/10 text-[#006828] px-1.5 py-0.5 rounded font-medium">
                                            {creative.cta}
                                          </span>
                                        )}
                                        <StatusBadge
                                          status={creative.status}
                                        />
                                      </div>
                                    </div>

                                    {creative.description && (
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {creative.description}
                                      </p>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                      {creative.linkedImage && (
                                        <Link
                                          href={`/images/${creative.linkedImage.id}`}
                                          className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1.5 hover:bg-muted transition-colors"
                                        >
                                          {creative.linkedImage.versions[0]
                                            ?.filePath && (
                                            <img
                                              src={`/api/files/${creative.linkedImage.versions[0].filePath}`}
                                              alt=""
                                              className="w-10 h-10 object-cover rounded"
                                            />
                                          )}
                                          <div>
                                            <p className="text-[11px] font-medium line-clamp-1">
                                              {creative.linkedImage.title}
                                            </p>
                                            {imgModel && (
                                              <p className="text-[10px] text-violet-600 font-mono">
                                                {imgModel}
                                              </p>
                                            )}
                                          </div>
                                        </Link>
                                      )}

                                      {creative.linkedCopy && (
                                        <Link
                                          href={`/content/${creative.linkedCopy.id}`}
                                          className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1.5 hover:bg-muted transition-colors flex-1 min-w-0"
                                        >
                                          <div className="min-w-0">
                                            <p className="text-[11px] font-medium line-clamp-1">
                                              {creative.linkedCopy.title}
                                            </p>
                                            {creative.linkedCopy.versions[0]
                                              ?.content && (
                                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                                {creative.linkedCopy.versions[0].content.slice(
                                                  0,
                                                  100
                                                )}
                                              </p>
                                            )}
                                          </div>
                                        </Link>
                                      )}
                                    </div>

                                    {creative.landingUrl && (
                                      <div className="flex items-center gap-2 text-[10px]">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">
                                          Landing
                                        </span>
                                        <span className="font-mono text-muted-foreground truncate">
                                          {creative.landingUrl}
                                        </span>
                                      </div>
                                    )}
                                    {utm && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(utm).map(
                                          ([key, value]) => (
                                            <span
                                              key={key}
                                              className="text-[10px] font-mono bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded"
                                            >
                                              {key}={value}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {group.creatives.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            No creatives yet. Use the CMO agent to generate ad
                            creatives for this group.
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No ad groups yet. Use the CMO agent to set up ad groups with
                targeting and creatives.
              </p>
            )}
          </Card>

          {/* Unlinked assets */}
          {unlinkedAssets.length > 0 && (
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-3">
                Supporting Assets (not linked to ad groups)
              </h3>
              <div className="space-y-1">
                {unlinkedAssets.map((asset) => {
                  const route = TYPE_ROUTES[asset.type] ?? "/library";
                  const model = getModelName(
                    asset.versions[0]?.metadata ?? null
                  );
                  return (
                    <Link key={asset.id} href={`${route}/${asset.id}`}>
                      <Card className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[10px] uppercase text-muted-foreground w-10 shrink-0">
                            {asset.type}
                          </span>
                          <span className="text-sm font-medium truncate">
                            {asset.title}
                          </span>
                          {model && (
                            <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                              {model}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {asset.platform && (
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {asset.platform}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            v{asset.currentVersion}
                          </span>
                          <StatusBadge status={asset.status} />
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ===== Tab 4: Distribution ===== */}
        <TabsContent value="distribution" className="mt-6 space-y-6">
          {/* Google Ads Sync */}
          {hasGoogleAds && (
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-4">
                Google Ads Sync
              </h3>
              <div className="space-y-3">
                {gAds?.resourceName ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                      <StatusBadge
                        status={
                          gAds.status === "ENABLED"
                            ? "GOOGLE_ENABLED"
                            : gAds.status === "PAUSED"
                              ? "GOOGLE_PAUSED"
                              : "SYNCED"
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Campaign ID
                      </span>
                      <span className="text-xs font-mono">
                        {gAds.googleId}
                      </span>
                    </div>
                    {gAds.syncedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Last synced
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(gAds.syncedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Not yet pushed to Google Ads.
                  </p>
                )}

                {syncMessage && (
                  <p className="text-[10px] text-[#006828] font-medium">
                    {syncMessage}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleSync("push")}
                    disabled={syncing}
                    className="text-[10px] px-3 py-1.5 rounded bg-[#006828] text-white hover:bg-[#005520] disabled:opacity-50 font-medium transition-colors"
                  >
                    {syncing
                      ? "..."
                      : gAds?.resourceName
                        ? "Re-sync"
                        : "Push to Google Ads"}
                  </button>
                  {gAds?.resourceName && (
                    <>
                      <button
                        onClick={() => handleSync("pull")}
                        disabled={syncing}
                        className="text-[10px] px-3 py-1.5 rounded border border-border text-foreground hover:bg-muted disabled:opacity-50 font-medium transition-colors"
                      >
                        Pull Status
                      </button>
                      <button
                        onClick={() => handleSync("pull-metrics")}
                        disabled={syncing}
                        className="text-[10px] px-3 py-1.5 rounded border border-border text-foreground hover:bg-muted disabled:opacity-50 font-medium transition-colors"
                      >
                        Pull Metrics
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Meta Ads placeholder */}
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-2">
              Meta Ads Sync
            </h3>
            <p className="text-xs text-muted-foreground">
              Meta Ads distribution will be available once the Meta Ads pipeline
              is connected. Configure META_ACCESS_TOKEN in your environment to
              enable.
            </p>
          </Card>

          {/* Social scheduling placeholder */}
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-2">
              Social Scheduling
            </h3>
            <p className="text-xs text-muted-foreground">
              Schedule campaign assets via Postiz. Connect your social accounts
              on the Social page to start scheduling.
            </p>
          </Card>

          {/* Active platforms summary */}
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-3">
              Platform Status
            </h3>
            {campaign.adGroups.length > 0 ? (
              <div className="space-y-2">
                {Array.from(
                  new Set(campaign.adGroups.map((g) => g.platform))
                ).map((platform) => {
                  const groupsForPlatform = campaign.adGroups.filter(
                    (g) => g.platform === platform
                  );
                  return (
                    <div
                      key={platform}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs capitalize">
                        {platform.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {groupsForPlatform.length} ad group
                          {groupsForPlatform.length !== 1 ? "s" : ""}
                        </span>
                        {platform === "google_ads" && gAds?.resourceName ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-green-50 text-green-700"
                          >
                            Synced
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            Not synced
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No platforms configured.
              </p>
            )}
          </Card>
        </TabsContent>

        {/* ===== Tab 5: Tracking ===== */}
        <TabsContent value="tracking" className="mt-6 space-y-6">
          {/* North Star Progress */}
          {(campaign.northStarTarget || campaign.northStarActual) && (
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-3">
                North Star Progress
              </h3>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Target
                  </p>
                  <p className="text-xl font-heading font-semibold">
                    {campaign.northStarTarget ?? "---"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Actual
                  </p>
                  <p className="text-xl font-heading font-semibold">
                    {campaign.northStarActual ?? "---"}
                  </p>
                </div>
                {campaign.northStarTarget &&
                  campaign.northStarActual != null && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Progress
                      </p>
                      <p className="text-xl font-heading font-semibold">
                        {Math.round(
                          (campaign.northStarActual /
                            campaign.northStarTarget) *
                            100
                        )}
                        %
                      </p>
                    </div>
                  )}
              </div>
            </Card>
          )}

          {/* Metrics by channel */}
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-4">
              Metric Snapshots
            </h3>
            {metrics.length > 0 ? (
              <div className="space-y-5">
                {Object.entries(metricsByChannel).map(
                  ([channel, channelMetrics]) => (
                    <div key={channel}>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                        {channel.replace(/_/g, " ")}
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-1.5 pr-4 text-muted-foreground font-medium">
                                Metric
                              </th>
                              <th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">
                                Value
                              </th>
                              <th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">
                                Period
                              </th>
                              <th className="text-right py-1.5 text-muted-foreground font-medium">
                                Recorded
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {channelMetrics.map((m) => (
                              <tr
                                key={m.id}
                                className="border-b border-border/50"
                              >
                                <td className="py-1.5 pr-4 capitalize">
                                  {m.metricType.replace(/_/g, " ")}
                                </td>
                                <td className="py-1.5 pr-4 text-right font-mono font-medium">
                                  {m.metricType.includes("rate") ||
                                  m.metricType === "ctr"
                                    ? `${m.value.toFixed(2)}%`
                                    : m.metricType.includes("spend") ||
                                        m.metricType.includes("cpa") ||
                                        m.metricType.includes("cost")
                                      ? `$${m.value.toFixed(2)}`
                                      : m.metricType === "roas"
                                        ? `${m.value.toFixed(2)}x`
                                        : m.value.toLocaleString()}
                                </td>
                                <td className="py-1.5 pr-4 text-right text-muted-foreground capitalize">
                                  {m.period}
                                </td>
                                <td className="py-1.5 text-right text-muted-foreground">
                                  {new Date(m.recordedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No metrics recorded yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Deploy the campaign and start the monitoring loop.
                </p>
              </div>
            )}
          </Card>

          {/* Google Ads Performance from metadata */}
          {gAds?.metrics && (
            <Card className="p-5">
              <h3 className="font-heading font-medium text-sm mb-3">
                Google Ads Performance
              </h3>
              {gAds.metrics.dateRange && (
                <p className="text-[10px] text-muted-foreground mb-3">
                  {gAds.metrics.dateRange.start} to{" "}
                  {gAds.metrics.dateRange.end}
                </p>
              )}
              <div className="space-y-2">
                {[
                  {
                    label: "Impressions",
                    value: gAds.metrics.impressions.toLocaleString(),
                  },
                  {
                    label: "Clicks",
                    value: gAds.metrics.clicks.toLocaleString(),
                  },
                  {
                    label: "CTR",
                    value: `${(gAds.metrics.ctr * 100).toFixed(2)}%`,
                  },
                  {
                    label: "Avg CPC",
                    value: `$${gAds.metrics.spend && gAds.metrics.clicks ? (gAds.metrics.spend / gAds.metrics.clicks).toFixed(2) : "0.00"}`,
                  },
                  {
                    label: "Conversions",
                    value: String(gAds.metrics.conversions),
                  },
                  {
                    label: "Cost/Conv",
                    value: `$${gAds.metrics.costPerConversion.toFixed(2)}`,
                  },
                  {
                    label: "Total Spend",
                    value: `$${gAds.metrics.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-muted-foreground">
                      {row.label}
                    </span>
                    <span className="text-xs font-medium font-mono">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ===== Tab 6: Optimize ===== */}
        <TabsContent value="optimize" className="mt-6 space-y-6">
          <Card className="p-5">
            <h3 className="font-heading font-medium text-sm mb-4">
              Optimization Decisions
            </h3>
            {optimizations.length > 0 ? (
              <div className="space-y-4">
                {optimizations.map((opt) => {
                  const beforeData = safeParse<Record<string, unknown>>(
                    opt.before
                  );
                  const afterData = safeParse<Record<string, unknown>>(
                    opt.after
                  );
                  const impactData = safeParse<Record<string, unknown>>(
                    opt.impact
                  );

                  return (
                    <Card
                      key={opt.id}
                      className="p-4 border border-border space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase"
                          >
                            {opt.decisionType.replace(/_/g, " ")}
                          </Badge>
                          <Badge
                            variant={
                              opt.status === "APPROVED"
                                ? "default"
                                : opt.status === "APPLIED"
                                  ? "default"
                                  : opt.status === "MEASURED"
                                    ? "default"
                                    : opt.status === "REJECTED"
                                      ? "destructive"
                                      : "outline"
                            }
                            className={`text-[10px] ${
                              opt.status === "APPROVED"
                                ? "bg-[#006828] text-white"
                                : opt.status === "APPLIED"
                                  ? "bg-blue-600 text-white"
                                  : opt.status === "MEASURED"
                                    ? "bg-violet-600 text-white"
                                    : ""
                            }`}
                          >
                            {opt.status}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(opt.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-foreground leading-relaxed">
                        {opt.rationale}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {beforeData && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                              Before
                            </p>
                            <pre className="text-[10px] font-mono bg-red-50 text-red-800 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(beforeData, null, 2)}
                            </pre>
                          </div>
                        )}
                        {afterData && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                              After
                            </p>
                            <pre className="text-[10px] font-mono bg-green-50 text-green-800 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(afterData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      {impactData && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            Measured Impact
                          </p>
                          <pre className="text-[10px] font-mono bg-violet-50 text-violet-800 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(impactData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No optimizations yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The agentic loop will propose optimizations after monitoring
                  identifies opportunities.
                </p>
              </div>
            )}
          </Card>

          {/* Cycle feedback callout */}
          <Card className="p-5 bg-[#006828]/5 border-[#006828]/20">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#006828"
                strokeWidth="1.5"
                className="shrink-0 mt-0.5"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              <div>
                <p className="text-sm font-heading font-medium text-[#006828]">
                  Continuous Improvement Cycle
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  After optimization, the cycle returns to Research and Tracking
                  to validate changes and discover new opportunities.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
