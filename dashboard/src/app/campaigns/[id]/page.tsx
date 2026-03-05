"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";

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

// --- Component ---

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [showTargeting, setShowTargeting] = useState(false);

  const fetchCampaign = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${id}`);
    if (res.ok) {
      setCampaign(await res.json());
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-lg">
            {campaign.name}
          </h2>
          {campaign.objective && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {campaign.objective}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {campaign.pillar && (
            <span className="text-xs uppercase tracking-wider bg-[#006828]/10 text-[#006828] px-2 py-1 rounded">
              {campaign.pillar.replace(/_/g, " ")}
            </span>
          )}
          <StatusBadge status={campaign.status} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Budget
          </p>
          <p className="text-xl font-heading font-semibold mt-1">
            {campaign.budget ? `$${campaign.budget.toLocaleString()}` : "---"}
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
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
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
      </div>

      {/* Audience & Targeting — collapsible */}
      {targeting && (
        <div>
          <button
            onClick={() => setShowTargeting(!showTargeting)}
            className="flex items-center gap-2 text-sm font-heading font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${showTargeting ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Campaign-Level Audience & Targeting
          </button>
          {showTargeting && (
            <Card className="p-4 mt-2">
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
        </div>
      )}

      {/* Main layout: Ad Groups (left 2/3) + KPIs (right 1/3) */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <h3 className="font-heading font-medium text-sm">
            Ad Groups ({campaign.adGroups.length})
          </h3>

          {campaign.adGroups.map((group) => {
            const groupTargeting = safeParse<GroupTargetingData>(
              group.targeting
            );
            const keywords = safeParse<KeywordData[]>(group.keywords);
            const specs =
              PLATFORM_SPECS[group.platform]?.[group.adType] ?? null;

            return (
              <Card key={group.id} className="p-0 overflow-hidden">
                {/* Row 1: Identity bar */}
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{group.name}</h4>
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
                  {/* Row 2: Who — targeting context */}
                  {groupTargeting && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                        Audience
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {groupTargeting.audience_type && (
                          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-medium">
                            {groupTargeting.audience_type.replace(/_/g, " ")}
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

                  {/* Row 3: Keywords (if search) */}
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

                  {/* Row 4: Platform specs */}
                  {specs && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                        Format Requirements — {specs.label}
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

                  {/* Row 5: Creatives */}
                  {group.creatives.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                        Creatives ({group.creatives.length})
                      </p>
                      <div className="space-y-2">
                        {group.creatives.map((creative) => {
                          const utm = safeParse<UtmData>(creative.utmParams);
                          const imgModel = creative.linkedImage?.versions[0]
                            ?.metadata
                            ? getModelName(
                                creative.linkedImage.versions[0].metadata
                              )
                            : null;

                          return (
                            <div
                              key={creative.id}
                              className="border border-border rounded-md p-3 space-y-2"
                            >
                              {/* Creative header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
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
                                  <StatusBadge status={creative.status} />
                                </div>
                              </div>

                              {/* Description */}
                              {creative.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {creative.description}
                                </p>
                              )}

                              {/* Linked assets */}
                              <div className="flex gap-3">
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

                              {/* Landing URL + UTM */}
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
                                  {Object.entries(utm).map(([key, value]) => (
                                    <span
                                      key={key}
                                      className="text-[10px] font-mono bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded"
                                    >
                                      {key}={value}
                                    </span>
                                  ))}
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

          {campaign.adGroups.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-xs">
                No ad groups yet. Use the CMO agent to set up ad groups with
                targeting and creatives.
              </p>
            </Card>
          )}

          {/* Unlinked assets */}
          {unlinkedAssets.length > 0 && (
            <div>
              <h3 className="font-heading font-medium text-sm mb-3 mt-6">
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
                      <Card className="p-3 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] uppercase text-muted-foreground w-10">
                            {asset.type}
                          </span>
                          <span className="text-sm font-medium">
                            {asset.title}
                          </span>
                          {model && (
                            <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded font-mono">
                              {model}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
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
          )}
        </div>

        {/* Right column: KPIs + Budget allocation */}
        <div className="space-y-4">
          {/* Budget by channel */}
          {Object.keys(budgetByChannel).length > 0 && (
            <div>
              <h3 className="font-heading font-medium text-sm mb-3">
                Budget by Channel
              </h3>
              <Card className="p-4 space-y-2">
                {Object.entries(budgetByChannel).map(([ch, amount]) => (
                  <div key={ch} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      {ch.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-medium font-mono">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex items-center justify-between">
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
              </Card>
            </div>
          )}

          {/* Channels */}
          {channels && channels.length > 0 && (
            <div>
              <h3 className="font-heading font-medium text-sm mb-3">
                Channels
              </h3>
              <Card className="p-4">
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
              </Card>
            </div>
          )}

          {/* KPIs */}
          <div>
            <h3 className="font-heading font-medium text-sm mb-3">
              Target KPIs
            </h3>
            <Card className="p-4 space-y-3">
              {kpis ? (
                Object.entries(kpis).map(([key, value]) => (
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
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No KPIs configured yet.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
