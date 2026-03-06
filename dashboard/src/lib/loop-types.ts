export interface LoopPhaseDefinition {
  key: string;
  label: string;
  description: string;
}

export interface LoopTypeDefinition {
  key: string;
  label: string;
  description: string;
  color: string;       // tailwind bg class
  textColor: string;   // tailwind text class
  dotColor: string;    // hex for dot/icon
  phases: LoopPhaseDefinition[];
}

export const LOOP_TYPES: Record<string, LoopTypeDefinition> = {
  ads: {
    key: "ads",
    label: "Paid Ads",
    description: "Google Ads + Meta Ads campaign loop: research, plan, create, deploy, monitor, optimize",
    color: "bg-blue-50",
    textColor: "text-blue-700",
    dotColor: "#2563eb",
    phases: [
      { key: "research", label: "Research", description: "Keyword research, audience personas, competitor analysis" },
      { key: "planning", label: "Planning", description: "Campaign structure, targeting, budget allocation, thresholds" },
      { key: "creation", label: "Creation", description: "Generate ad copy, images, creatives, brand checks" },
      { key: "deployment", label: "Deployment", description: "Push campaigns to Google Ads and Meta Ads" },
      { key: "monitoring", label: "Monitoring", description: "Pull metrics, compare actuals vs targets, flag issues" },
      { key: "optimization", label: "Optimization", description: "Budget reallocation, keyword changes, creative rotation" },
    ],
  },
  content_seo: {
    key: "content_seo",
    label: "Content / SEO",
    description: "Content creation and SEO optimization loop",
    color: "bg-amber-50",
    textColor: "text-amber-700",
    dotColor: "#f59e0b",
    phases: [
      { key: "research", label: "Research", description: "Content gap analysis, keyword opportunities, competitor content" },
      { key: "planning", label: "Planning", description: "Content calendar, topic assignment, target keywords" },
      { key: "creation", label: "Creation", description: "Write blog posts, landing pages, case studies" },
      { key: "publishing", label: "Publishing", description: "Publish content, add schema markup, submit to search" },
      { key: "tracking", label: "Tracking", description: "Monitor rankings, organic traffic, engagement" },
      { key: "optimization", label: "Optimization", description: "Refresh underperforming content, add internal links" },
    ],
  },
  social: {
    key: "social",
    label: "Social Media",
    description: "Social media content and engagement loop",
    color: "bg-pink-50",
    textColor: "text-pink-700",
    dotColor: "#ec4899",
    phases: [
      { key: "planning", label: "Planning", description: "Posting cadence, content themes, platform mix" },
      { key: "creation", label: "Creation", description: "Generate post copy, images, carousels" },
      { key: "scheduling", label: "Scheduling", description: "Schedule posts via Postiz across platforms" },
      { key: "monitoring", label: "Monitoring", description: "Track engagement, reach, click-throughs" },
      { key: "adjustment", label: "Adjustment", description: "Optimize timing, content types, platform focus" },
    ],
  },
  email: {
    key: "email",
    label: "Email Marketing",
    description: "Email campaign and drip sequence loop",
    color: "bg-purple-50",
    textColor: "text-purple-700",
    dotColor: "#8b5cf6",
    phases: [
      { key: "planning", label: "Planning", description: "Email sequences, segmentation, send schedule" },
      { key: "creation", label: "Creation", description: "Write email copy, design templates" },
      { key: "sending", label: "Sending", description: "Send via email service provider" },
      { key: "tracking", label: "Tracking", description: "Open rates, click rates, conversions, unsubscribes" },
      { key: "optimization", label: "Optimization", description: "Subject line testing, send time optimization" },
    ],
  },
  cross_channel: {
    key: "cross_channel",
    label: "Cross-Channel",
    description: "Meta-loop that optimizes budget and effort across all channels",
    color: "bg-emerald-50",
    textColor: "text-emerald-700",
    dotColor: "#006828",
    phases: [
      { key: "aggregation", label: "Aggregation", description: "Pull metrics from all channels" },
      { key: "analysis", label: "Analysis", description: "Compare cost-per-conversion, identify best performers" },
      { key: "reallocation", label: "Reallocation", description: "Shift budgets to highest-converting channels" },
    ],
  },
};

export function getLoopType(key: string): LoopTypeDefinition | null {
  return LOOP_TYPES[key] ?? null;
}

export function getPhaseIndex(loopType: string, phase: string): number {
  const loop = LOOP_TYPES[loopType];
  if (!loop) return -1;
  return loop.phases.findIndex((p) => p.key === phase);
}

export function getNextPhase(loopType: string, currentPhase: string): string | null {
  const loop = LOOP_TYPES[loopType];
  if (!loop) return null;
  const idx = loop.phases.findIndex((p) => p.key === currentPhase);
  if (idx === -1) return null;
  // Last phase cycles back to monitoring/tracking phase (the feedback loop)
  if (idx === loop.phases.length - 1) {
    // Find the monitoring/tracking phase to cycle back to
    const monitorPhase = loop.phases.find(
      (p) => p.key === "monitoring" || p.key === "tracking" || p.key === "aggregation"
    );
    return monitorPhase?.key ?? loop.phases[0].key;
  }
  return loop.phases[idx + 1].key;
}

export const METRIC_TYPES = [
  "impressions",
  "clicks",
  "ctr",
  "spend",
  "conversions",
  "cpa",
  "roas",
  "demo_bookings",
  "website_visits",
  "seo_rank",
] as const;

export const CHANNELS = [
  "google_ads",
  "meta_ads",
  "linkedin",
  "organic_search",
  "social",
  "email",
  "overall",
] as const;

export const OPTIMIZATION_TYPES = [
  "budget_realloc",
  "targeting_change",
  "creative_swap",
  "keyword_add",
  "keyword_pause",
  "bid_adjust",
  "channel_pause",
  "content_refresh",
] as const;
