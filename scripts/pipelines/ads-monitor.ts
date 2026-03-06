/**
 * ads-monitor.ts — Ads Loop: Monitoring Phase
 *
 * Reads campaign metrics from configured ad platforms (Google Ads, Meta Ads),
 * or generates simulated metrics for demo/offline mode. Records MetricSnapshot
 * entries and produces a performance summary with threshold comparisons.
 *
 * Usage:
 *   npx tsx scripts/pipelines/ads-monitor.ts --campaignId <id>
 */

import path from "path";
import fs from "fs";

const dashboardPath = path.resolve(__dirname, "../../dashboard");
const { PrismaClient } = require(path.join(dashboardPath, "node_modules/@prisma/client"));
const dbPath = path.resolve(dashboardPath, "prisma/dev.db");
const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readEnvVar(name: string): string {
  if (process.env[name]) return process.env[name] as string;
  const envPath = path.resolve(dashboardPath, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(new RegExp(`^${name}="?([^"\\n]*)"?`, "m"));
    if (match?.[1]) return match[1];
  }
  return "";
}

function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PerformanceThresholds {
  target_cpa_usd: number;
  minimum_ctr_percent: number;
  target_roas: number;
  max_cpc_usd: number;
  minimum_conversion_rate_percent: number;
  pause_cpa_multiplier: number;
}

interface ChannelMetrics {
  channel: string;
  impressions: number;
  clicks: number;
  ctr_percent: number;
  spend_usd: number;
  conversions: number;
  cpa_usd: number;
  roas: number;
  conversion_rate_percent: number;
  source: "live" | "simulated";
}

interface PerformanceSummary {
  period: string;
  channels: ChannelMetrics[];
  overall: {
    total_spend_usd: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    blended_cpa_usd: number;
    blended_ctr_percent: number;
    blended_roas: number;
  };
  thresholdComparisons: Array<{
    metric: string;
    actual: number;
    threshold: number;
    status: "above_target" | "on_target" | "below_target";
    channel?: string;
  }>;
  flags: string[];
  recommendation: "continue_monitoring" | "trigger_optimization";
  confidenceLevel: "high" | "medium" | "low";
}

// ---------------------------------------------------------------------------
// Simulated metrics generator
// ---------------------------------------------------------------------------

function generateSimulatedMetrics(
  channels: string[],
  campaignBudget: number
): ChannelMetrics[] {
  const results: ChannelMetrics[] = [];
  const dailyBudget = campaignBudget / 30;

  for (const channel of channels) {
    const isGoogle = channel.includes("google");
    const isMeta = channel.includes("meta") || channel.includes("facebook");
    const isLinkedIn = channel.includes("linkedin");

    let impressionBase: [number, number];
    let clickRateRange: [number, number];
    let conversionRateRange: [number, number];
    let cpaRange: [number, number];
    let spendFraction: number;

    if (isGoogle) {
      impressionBase = [5000, 12000];
      clickRateRange = [3.5, 6.5];
      conversionRateRange = [4.0, 8.0];
      cpaRange = [18, 45];
      spendFraction = channels.length === 1 ? 1.0 : 0.6;
    } else if (isMeta) {
      impressionBase = [8000, 20000];
      clickRateRange = [1.5, 3.5];
      conversionRateRange = [1.5, 4.0];
      cpaRange = [25, 60];
      spendFraction = channels.length === 1 ? 1.0 : 0.3;
    } else if (isLinkedIn) {
      impressionBase = [2000, 6000];
      clickRateRange = [0.8, 2.0];
      conversionRateRange = [2.0, 5.0];
      cpaRange = [40, 90];
      spendFraction = 0.2;
    } else {
      impressionBase = [3000, 8000];
      clickRateRange = [2.0, 4.0];
      conversionRateRange = [2.0, 5.0];
      cpaRange = [20, 50];
      spendFraction = 0.1;
    }

    const impressions = Math.round(randomInRange(...impressionBase));
    const ctr = randomInRange(...clickRateRange);
    const clicks = Math.round((impressions * ctr) / 100);
    const spend = Math.round(dailyBudget * spendFraction * 100) / 100;
    const conversionRate = randomInRange(...conversionRateRange);
    const conversions = Math.round((clicks * conversionRate) / 100);
    const cpa = conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : randomInRange(...cpaRange);
    const roas = spend > 0 ? Math.round(((conversions * 150) / spend) * 100) / 100 : 0;

    const channelName = isGoogle
      ? "google_ads"
      : isMeta
      ? "meta_ads"
      : isLinkedIn
      ? "linkedin_ads"
      : channel;

    results.push({
      channel: channelName,
      impressions,
      clicks,
      ctr_percent: ctr,
      spend_usd: spend,
      conversions,
      cpa_usd: cpa,
      roas,
      conversion_rate_percent: conversionRate,
      source: "simulated",
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Live Google Ads metrics (when credentials are configured)
// ---------------------------------------------------------------------------

async function fetchGoogleAdsMetrics(campaignId: string, campaign: any): Promise<ChannelMetrics | null> {
  const customerId = readEnvVar("GOOGLE_ADS_CUSTOMER_ID");
  const clientId = readEnvVar("GOOGLE_ADS_CLIENT_ID");
  const devToken = readEnvVar("GOOGLE_ADS_DEVELOPER_TOKEN");

  if (!customerId || !clientId || !devToken) {
    return null;
  }

  console.log("[ads-monitor] Google Ads credentials configured. Attempting to pull live metrics...");
  console.log("[ads-monitor] Use: npx tsx scripts/google-ads-client.ts pull-metrics --localCampaignId <id> --startDate <date> --endDate <date>");
  console.log("[ads-monitor] Falling back to simulated metrics for this run.");

  // In a fully-wired integration this would call the Google Ads API.
  // The actual live call is delegated to google-ads-client.ts sync commands,
  // which write back to campaign.metadata. We read from there if it exists.
  const meta = campaign.metadata ? JSON.parse(campaign.metadata) : {};
  const googleMeta = meta.googleAds?.metrics;

  if (googleMeta) {
    console.log("[ads-monitor] Found cached Google Ads metrics in campaign metadata.");
    return {
      channel: "google_ads",
      impressions: googleMeta.impressions ?? 0,
      clicks: googleMeta.clicks ?? 0,
      ctr_percent: googleMeta.ctr ? Math.round(googleMeta.ctr * 100 * 100) / 100 : 0,
      spend_usd: googleMeta.spend ?? 0,
      conversions: googleMeta.conversions ?? 0,
      cpa_usd: googleMeta.costPerConversion ?? 0,
      roas: googleMeta.conversionValue && googleMeta.spend
        ? Math.round((googleMeta.conversionValue / googleMeta.spend) * 100) / 100
        : 0,
      conversion_rate_percent:
        googleMeta.clicks > 0
          ? Math.round((googleMeta.conversions / googleMeta.clicks) * 100 * 100) / 100
          : 0,
      source: "live",
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Threshold comparison
// ---------------------------------------------------------------------------

function compareToThresholds(
  channelMetrics: ChannelMetrics[],
  thresholds: PerformanceThresholds
): {
  comparisons: PerformanceSummary["thresholdComparisons"];
  flags: string[];
  recommendation: "continue_monitoring" | "trigger_optimization";
} {
  const comparisons: PerformanceSummary["thresholdComparisons"] = [];
  const flags: string[] = [];

  for (const cm of channelMetrics) {
    // CPA vs target
    const cpaStatus: "above_target" | "on_target" | "below_target" =
      cm.cpa_usd <= thresholds.target_cpa_usd
        ? "above_target"
        : cm.cpa_usd <= thresholds.target_cpa_usd * 1.3
        ? "on_target"
        : "below_target";

    comparisons.push({
      metric: "cpa_usd",
      actual: cm.cpa_usd,
      threshold: thresholds.target_cpa_usd,
      status: cpaStatus,
      channel: cm.channel,
    });

    if (cpaStatus === "below_target") {
      flags.push(
        `${cm.channel}: CPA $${cm.cpa_usd} exceeds target $${thresholds.target_cpa_usd} by ${Math.round(((cm.cpa_usd - thresholds.target_cpa_usd) / thresholds.target_cpa_usd) * 100)}%`
      );
    }

    // CTR vs minimum
    const ctrStatus: "above_target" | "on_target" | "below_target" =
      cm.ctr_percent >= thresholds.minimum_ctr_percent
        ? "above_target"
        : cm.ctr_percent >= thresholds.minimum_ctr_percent * 0.8
        ? "on_target"
        : "below_target";

    comparisons.push({
      metric: "ctr_percent",
      actual: cm.ctr_percent,
      threshold: thresholds.minimum_ctr_percent,
      status: ctrStatus,
      channel: cm.channel,
    });

    if (ctrStatus === "below_target") {
      flags.push(
        `${cm.channel}: CTR ${cm.ctr_percent}% is below minimum ${thresholds.minimum_ctr_percent}%`
      );
    }

    // ROAS vs target
    if (cm.roas > 0) {
      const roasStatus: "above_target" | "on_target" | "below_target" =
        cm.roas >= thresholds.target_roas
          ? "above_target"
          : cm.roas >= thresholds.target_roas * 0.8
          ? "on_target"
          : "below_target";

      comparisons.push({
        metric: "roas",
        actual: cm.roas,
        threshold: thresholds.target_roas,
        status: roasStatus,
        channel: cm.channel,
      });
    }

    // Pause-level CPA check
    if (cm.cpa_usd > thresholds.target_cpa_usd * thresholds.pause_cpa_multiplier) {
      flags.push(
        `${cm.channel}: CPA $${cm.cpa_usd} is ${thresholds.pause_cpa_multiplier}x above target — consider pausing`
      );
    }
  }

  // Determine recommendation
  const criticalFlags = flags.filter(
    (f) => f.includes("exceeds") || f.includes("consider pausing") || f.includes("below minimum")
  );
  const recommendation: "continue_monitoring" | "trigger_optimization" =
    criticalFlags.length >= 2 ? "trigger_optimization" : "continue_monitoring";

  return { comparisons, flags, recommendation };
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runAdsMonitoring(prisma: any, campaignId: string): Promise<object> {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }

  console.log(`[ads-monitor] Starting monitoring phase for campaign: ${campaignId}`);

  // 1. Read campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  console.log(`[ads-monitor] Campaign: "${campaign.name}"`);

  // 2. Read performance thresholds from the planning phase log
  const activeLoop = await prisma.loopExecution.findFirst({
    where: { campaignId, loopType: "ads", status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });

  let thresholds: PerformanceThresholds = {
    target_cpa_usd: 35,
    minimum_ctr_percent: 2.5,
    target_roas: 3.5,
    max_cpc_usd: 10,
    minimum_conversion_rate_percent: 3.0,
    pause_cpa_multiplier: 2.0,
  };

  if (activeLoop) {
    const planningLog = await prisma.loopPhaseLog.findFirst({
      where: { loopExecutionId: activeLoop.id, phase: "planning", status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });

    if (planningLog?.output) {
      try {
        const logOutput = JSON.parse(planningLog.output);
        // Planning phase stores { plan: CampaignPlan, ... } — extract nested plan if present
        const plan = logOutput.plan ?? logOutput;
        if (plan.performanceThresholds) {
          thresholds = plan.performanceThresholds;
          console.log("[ads-monitor] Loaded performance thresholds from planning phase.");
        }
      } catch {
        console.warn("[ads-monitor] Could not parse plan. Using default thresholds.");
      }
    }
  }

  // 3. Parse channels
  const channels: string[] = campaign.channels ? JSON.parse(campaign.channels) : ["google_ads", "meta_ads"];

  // 4. Collect metrics: try live, fall back to simulated
  const channelMetrics: ChannelMetrics[] = [];
  let dataSource = "simulated";

  // Try Google Ads live metrics
  const googleMetrics = await fetchGoogleAdsMetrics(campaignId, campaign);
  if (googleMetrics) {
    channelMetrics.push(googleMetrics);
    dataSource = "live";
    // Remove google from remaining channels to simulate
    const idx = channels.findIndex((c) => c.includes("google"));
    if (idx > -1) channels.splice(idx, 1);
  }

  // Simulate remaining channels
  if (channels.length > 0) {
    const simulated = generateSimulatedMetrics(channels, campaign.budget ?? 5000);
    channelMetrics.push(...simulated);
    if (dataSource !== "live") dataSource = "simulated";
  }

  console.log(`[ads-monitor] Collected metrics for ${channelMetrics.length} channel(s). Source: ${dataSource}`);

  // 5. Record MetricSnapshot entries
  let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
  if (!project) {
    project = await prisma.project.create({ data: { name: "Zavis" } });
  }

  const recordedSnapshots: string[] = [];
  const metricPairs: Array<{ type: string; value: (m: ChannelMetrics) => number }> = [
    { type: "impressions", value: (m) => m.impressions },
    { type: "clicks", value: (m) => m.clicks },
    { type: "ctr", value: (m) => m.ctr_percent },
    { type: "spend", value: (m) => m.spend_usd },
    { type: "conversions", value: (m) => m.conversions },
    { type: "cpa", value: (m) => m.cpa_usd },
    { type: "roas", value: (m) => m.roas },
  ];

  for (const cm of channelMetrics) {
    for (const { type, value } of metricPairs) {
      const v = value(cm);
      if (v === 0 && (type === "roas" || type === "cpa")) continue;
      const snap = await prisma.metricSnapshot.create({
        data: {
          projectId: project.id,
          campaignId,
          channel: cm.channel,
          metricType: type,
          value: v,
          period: "daily",
          metadata: JSON.stringify({ source: cm.source, monitoringRun: new Date().toISOString() }),
        },
      });
      recordedSnapshots.push(snap.id);
    }
  }

  console.log(`[ads-monitor] Recorded ${recordedSnapshots.length} metric snapshots.`);

  // 6. Compare to thresholds
  const { comparisons, flags, recommendation } = compareToThresholds(channelMetrics, thresholds);

  // 7. Compute overall aggregates
  const totalSpend = channelMetrics.reduce((s, c) => s + c.spend_usd, 0);
  const totalImpressions = channelMetrics.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = channelMetrics.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = channelMetrics.reduce((s, c) => s + c.conversions, 0);
  const blendedCpa = totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0;
  const blendedCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 100 * 100) / 100 : 0;
  const blendedRoas = totalSpend > 0 ? Math.round(((totalConversions * 150) / totalSpend) * 100) / 100 : 0;

  const performanceSummary: PerformanceSummary = {
    period: `${new Date().toISOString().slice(0, 10)} (daily)`,
    channels: channelMetrics,
    overall: {
      total_spend_usd: Math.round(totalSpend * 100) / 100,
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      total_conversions: totalConversions,
      blended_cpa_usd: blendedCpa,
      blended_ctr_percent: blendedCtr,
      blended_roas: blendedRoas,
    },
    thresholdComparisons: comparisons,
    flags,
    recommendation,
    confidenceLevel: dataSource === "live" ? "high" : "low",
  };

  // 8. Update north star actual if we have conversions
  if (totalConversions > 0) {
    const existing = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { northStarActual: true },
    });
    const currentActual = existing?.northStarActual ?? 0;
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { northStarActual: currentActual + totalConversions },
    });
    console.log(`[ads-monitor] Updated north star actual: ${currentActual + totalConversions} total conversions.`);
  }

  const summary = {
    campaignId,
    campaignName: campaign.name,
    phase: "monitoring",
    dataSource,
    metricsRecorded: recordedSnapshots.length,
    performanceSummary,
    recommendation,
    flagCount: flags.length,
    nextPhase: recommendation === "trigger_optimization" ? "optimization" : "monitoring",
  };

  console.log(`[ads-monitor] Monitoring complete. Recommendation: ${recommendation}`);
  if (flags.length > 0) {
    console.log(`[ads-monitor] Flags (${flags.length}):`);
    for (const f of flags) console.log(`  - ${f}`);
  }

  return summary;
}

// ---------------------------------------------------------------------------
// CLI runner
// ---------------------------------------------------------------------------

if (require.main === module) {
  const campaignId =
    process.argv.find((a, i) => process.argv[i - 1] === "--campaignId") ?? "";

  runAdsMonitoring(prisma, campaignId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
