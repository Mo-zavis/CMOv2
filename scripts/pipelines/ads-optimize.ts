/**
 * ads-optimize.ts — Ads Loop: Optimization Phase
 *
 * Reads recent MetricSnapshot data, analyzes performance per channel,
 * and generates OptimizationDecision records with budget reallocation
 * and channel-level recommendations.
 *
 * Usage:
 *   npx tsx scripts/pipelines/ads-optimize.ts --campaignId <id>
 */

import path from "path";

const dashboardPath = path.resolve(__dirname, "../../dashboard");
const { PrismaClient } = require(path.join(dashboardPath, "node_modules/@prisma/client"));
const dbPath = path.resolve(dashboardPath, "prisma/dev.db");
const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });

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

interface ChannelAllocation {
  channel: string;
  budget_percent: number;
  daily_budget_usd: number;
}

interface ChannelPerformance {
  channel: string;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCpa: number;
  avgCtr: number;
  avgRoas: number;
  conversionRate: number;
  dataPoints: number;
}

interface OptimizationDecisionRecord {
  id: string;
  decisionType: string;
  channel: string;
  rationale: string;
  action: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function aggregateChannelMetrics(
  snapshots: Array<{
    channel: string;
    metricType: string;
    value: number;
    recordedAt: Date;
  }>
): ChannelPerformance[] {
  const byChannel: Record<string, Record<string, number[]>> = {};

  for (const snap of snapshots) {
    if (!byChannel[snap.channel]) byChannel[snap.channel] = {};
    if (!byChannel[snap.channel][snap.metricType]) byChannel[snap.channel][snap.metricType] = [];
    byChannel[snap.channel][snap.metricType].push(snap.value);
  }

  const results: ChannelPerformance[] = [];

  for (const [channel, metrics] of Object.entries(byChannel)) {
    const sum = (arr: number[] | undefined): number => (arr ?? []).reduce((a, b) => a + b, 0);
    const avg = (arr: number[] | undefined): number => {
      if (!arr || arr.length === 0) return 0;
      return Math.round((sum(arr) / arr.length) * 100) / 100;
    };

    const totalSpend = sum(metrics["spend"]);
    const totalConversions = sum(metrics["conversions"]);
    const totalClicks = sum(metrics["clicks"]);
    const totalImpressions = sum(metrics["impressions"]);
    const avgCpa = totalConversions > 0
      ? Math.round((totalSpend / totalConversions) * 100) / 100
      : avg(metrics["cpa"]);
    const avgRoas = totalSpend > 0
      ? Math.round(((totalConversions * 150) / totalSpend) * 100) / 100
      : avg(metrics["roas"]);
    const avgCtr = totalImpressions > 0
      ? Math.round((totalClicks / totalImpressions) * 100 * 100) / 100
      : avg(metrics["ctr"]);
    const conversionRate = totalClicks > 0
      ? Math.round((totalConversions / totalClicks) * 100 * 100) / 100
      : 0;

    results.push({
      channel,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalImpressions,
      totalClicks,
      totalConversions: Math.round(totalConversions),
      avgCpa,
      avgCtr,
      avgRoas,
      conversionRate,
      dataPoints: snapshots.filter((s) => s.channel === channel).length,
    });
  }

  return results;
}

function classifyPerformance(
  performance: ChannelPerformance,
  thresholds: PerformanceThresholds
): "overperforming" | "on_target" | "underperforming" | "critical" {
  if (performance.avgCpa === 0 && performance.totalConversions === 0) return "on_target";

  const cpaRatio = performance.avgCpa / thresholds.target_cpa_usd;

  if (cpaRatio <= 0.5) return "overperforming";
  if (cpaRatio <= 1.3) return "on_target";
  if (cpaRatio <= thresholds.pause_cpa_multiplier) return "underperforming";
  return "critical";
}

// ---------------------------------------------------------------------------
// Budget reallocation logic
// ---------------------------------------------------------------------------

function computeNewBudgetAllocation(
  performances: ChannelPerformance[],
  currentAllocation: ChannelAllocation[],
  thresholds: PerformanceThresholds,
  totalDailyBudget: number
): Array<{ channel: string; old_percent: number; new_percent: number; daily_budget_usd: number }> {
  // Score each channel: lower CPA relative to target = higher score
  const scores: Record<string, number> = {};

  for (const perf of performances) {
    const classification = classifyPerformance(perf, thresholds);
    switch (classification) {
      case "overperforming":
        scores[perf.channel] = 3.0;
        break;
      case "on_target":
        scores[perf.channel] = 2.0;
        break;
      case "underperforming":
        scores[perf.channel] = 1.0;
        break;
      case "critical":
        scores[perf.channel] = 0.1; // Keep minimal budget to continue data collection
        break;
    }
  }

  // Channels in allocation but with no performance data get neutral score
  for (const alloc of currentAllocation) {
    if (!(alloc.channel in scores)) {
      scores[alloc.channel] = 1.5;
    }
  }

  // Normalize scores to percentages
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const newAllocation: Array<{ channel: string; old_percent: number; new_percent: number; daily_budget_usd: number }> = [];

  for (const alloc of currentAllocation) {
    const score = scores[alloc.channel] ?? 1.5;
    const newPercent = totalScore > 0 ? Math.round((score / totalScore) * 100) : alloc.budget_percent;
    newAllocation.push({
      channel: alloc.channel,
      old_percent: alloc.budget_percent,
      new_percent: newPercent,
      daily_budget_usd: Math.round((totalDailyBudget * newPercent) / 100),
    });
  }

  return newAllocation;
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runAdsOptimization(prisma: any, campaignId: string): Promise<object> {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }

  console.log(`[ads-optimize] Starting optimization phase for campaign: ${campaignId}`);

  // 1. Read campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  console.log(`[ads-optimize] Campaign: "${campaign.name}"`);

  // 2. Find project
  let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
  if (!project) {
    project = await prisma.project.create({ data: { name: "Zavis" } });
  }

  // 3. Read recent MetricSnapshot data (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const snapshots = await prisma.metricSnapshot.findMany({
    where: {
      campaignId,
      recordedAt: { gte: sevenDaysAgo },
    },
    orderBy: { recordedAt: "asc" },
  });

  console.log(`[ads-optimize] Found ${snapshots.length} metric snapshots from the last 7 days.`);

  if (snapshots.length === 0) {
    console.warn("[ads-optimize] No metric data found. Run ads-monitor first.");
    return {
      campaignId,
      campaignName: campaign.name,
      phase: "optimization",
      status: "NO_DATA",
      message: "No metric data available. Run the monitoring phase first.",
      nextPhase: "monitoring",
    };
  }

  // 4. Read current budget allocation from the planning phase log
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

  let currentAllocation: ChannelAllocation[] = [];
  const totalBudget = campaign.budget ?? 5000;

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
        if (plan.performanceThresholds) thresholds = plan.performanceThresholds;
        if (plan.channelAllocation) currentAllocation = plan.channelAllocation;
        console.log("[ads-optimize] Loaded thresholds and allocation from planning phase.");
      } catch {
        console.warn("[ads-optimize] Could not parse plan output.");
      }
    }
  }

  // Build default allocation from channel data if we have none
  if (currentAllocation.length === 0) {
    const channels: string[] = campaign.channels ? JSON.parse(campaign.channels) : ["google_ads", "meta_ads"];
    const percentEach = Math.floor(100 / channels.length);
    currentAllocation = channels.map((c) => ({
      channel: c,
      budget_percent: percentEach,
      daily_budget_usd: Math.round((totalBudget * percentEach) / 100 / 30),
    }));
  }

  const totalDailyBudget = Math.round(totalBudget / 30);

  // 5. Aggregate performance by channel
  const channelPerformances = aggregateChannelMetrics(snapshots);
  console.log(`[ads-optimize] Aggregated performance for ${channelPerformances.length} channel(s).`);

  // 6. Classify each channel
  const classifications: Record<string, ReturnType<typeof classifyPerformance>> = {};
  for (const perf of channelPerformances) {
    const c = classifyPerformance(perf, thresholds);
    classifications[perf.channel] = c;
    console.log(`[ads-optimize] ${perf.channel}: ${c} (CPA: $${perf.avgCpa}, target: $${thresholds.target_cpa_usd})`);
  }

  // 7. Compute new budget allocation
  const newAllocation = computeNewBudgetAllocation(
    channelPerformances,
    currentAllocation,
    thresholds,
    totalDailyBudget
  );

  // 8. Generate OptimizationDecision records
  const decisions: OptimizationDecisionRecord[] = [];

  // 8a. Budget reallocation decision
  const allocationChanged = newAllocation.some((a) => Math.abs(a.new_percent - a.old_percent) >= 5);

  if (allocationChanged) {
    const reallocationRationale =
      "Performance data from the last 7 days shows uneven CPA across channels. " +
      newAllocation
        .map((a) => `${a.channel}: ${a.old_percent}% -> ${a.new_percent}% budget`)
        .join("; ");

    const decision = await prisma.optimizationDecision.create({
      data: {
        projectId: project.id,
        campaignId,
        loopExecutionId: activeLoop?.id ?? null,
        decisionType: "budget_realloc",
        rationale: reallocationRationale,
        before: JSON.stringify({
          allocation: currentAllocation,
          totalDailyBudget,
          basedOn: "planning_phase",
        }),
        after: JSON.stringify({
          allocation: newAllocation,
          totalDailyBudget,
          basedOn: "7_day_performance_data",
        }),
        status: "PROPOSED",
      },
    });

    decisions.push({
      id: decision.id,
      decisionType: "budget_realloc",
      channel: "all",
      rationale: reallocationRationale,
      action: "Shift budget from high-CPA channels to low-CPA channels",
      before: { allocation: currentAllocation },
      after: { allocation: newAllocation },
    });

    console.log(`[ads-optimize] Created budget reallocation decision: ${decision.id}`);
  }

  // 8b. Per-channel decisions
  for (const perf of channelPerformances) {
    const classification = classifications[perf.channel];

    if (classification === "critical") {
      // Recommend pausing
      const rationale =
        `${perf.channel} has a CPA of $${perf.avgCpa}, which is ${Math.round((perf.avgCpa / thresholds.target_cpa_usd) * 100)}% of the target ($${thresholds.target_cpa_usd}). ` +
        `This exceeds the ${thresholds.pause_cpa_multiplier}x pause threshold. ` +
        `Recommend pausing to stop budget drain while creatives are refreshed.`;

      const decision = await prisma.optimizationDecision.create({
        data: {
          projectId: project.id,
          campaignId,
          loopExecutionId: activeLoop?.id ?? null,
          decisionType: "channel_pause",
          rationale,
          before: JSON.stringify({
            channel: perf.channel,
            status: "active",
            avgCpa: perf.avgCpa,
            totalSpend: perf.totalSpend,
            totalConversions: perf.totalConversions,
          }),
          after: JSON.stringify({
            channel: perf.channel,
            status: "paused",
            action: "Pause until new creatives are ready and CPA can be re-evaluated",
          }),
          status: "PROPOSED",
        },
      });

      decisions.push({
        id: decision.id,
        decisionType: "channel_pause",
        channel: perf.channel,
        rationale,
        action: `Pause ${perf.channel} — CPA $${perf.avgCpa} exceeds ${thresholds.pause_cpa_multiplier}x target`,
        before: { status: "active", avgCpa: perf.avgCpa },
        after: { status: "paused" },
      });

      console.log(`[ads-optimize] Created channel_pause decision for ${perf.channel}`);
    } else if (classification === "overperforming") {
      // Recommend increasing budget
      const currentAllocEntry = currentAllocation.find((a) => a.channel === perf.channel);
      const currentPercent = currentAllocEntry?.budget_percent ?? 0;
      const suggestedPercent = Math.min(100, Math.round(currentPercent * 1.3));
      const budgetIncrease = Math.round(totalDailyBudget * (suggestedPercent - currentPercent) / 100);

      const rationale =
        `${perf.channel} is overperforming with a CPA of $${perf.avgCpa}, which is ${Math.round((1 - perf.avgCpa / thresholds.target_cpa_usd) * 100)}% below target ($${thresholds.target_cpa_usd}). ` +
        `Increasing budget allocation from ${currentPercent}% to ${suggestedPercent}% should capture additional conversions at a favorable rate. ` +
        `Estimated additional daily spend: $${budgetIncrease}.`;

      const decision = await prisma.optimizationDecision.create({
        data: {
          projectId: project.id,
          campaignId,
          loopExecutionId: activeLoop?.id ?? null,
          decisionType: "budget_realloc",
          rationale,
          before: JSON.stringify({
            channel: perf.channel,
            budget_percent: currentPercent,
            daily_budget_usd: currentAllocEntry?.daily_budget_usd ?? 0,
            avgCpa: perf.avgCpa,
          }),
          after: JSON.stringify({
            channel: perf.channel,
            budget_percent: suggestedPercent,
            daily_budget_usd: (currentAllocEntry?.daily_budget_usd ?? 0) + budgetIncrease,
            expectedCpa: perf.avgCpa,
          }),
          status: "PROPOSED",
        },
      });

      decisions.push({
        id: decision.id,
        decisionType: "budget_increase",
        channel: perf.channel,
        rationale,
        action: `Increase ${perf.channel} budget from ${currentPercent}% to ${suggestedPercent}% (+$${budgetIncrease}/day)`,
        before: { budget_percent: currentPercent },
        after: { budget_percent: suggestedPercent },
      });

      console.log(`[ads-optimize] Created budget increase decision for ${perf.channel}`);
    }

    // 8c. Keyword/bid adjustment for underperforming Google channels
    if (
      perf.channel === "google_ads" &&
      (classification === "underperforming") &&
      perf.avgCtr < thresholds.minimum_ctr_percent
    ) {
      const rationale =
        `Google Ads CTR of ${perf.avgCtr}% is below the minimum threshold of ${thresholds.minimum_ctr_percent}%. ` +
        `This suggests ad copy is not resonating with searchers or keyword match types are too broad. ` +
        `Recommend reviewing headline performance and pausing low-CTR keywords.`;

      const decision = await prisma.optimizationDecision.create({
        data: {
          projectId: project.id,
          campaignId,
          loopExecutionId: activeLoop?.id ?? null,
          decisionType: "bid_adjust",
          rationale,
          before: JSON.stringify({
            channel: "google_ads",
            avgCtr: perf.avgCtr,
            minimumCtrThreshold: thresholds.minimum_ctr_percent,
          }),
          after: JSON.stringify({
            action: "Review ad copy for CTR improvement",
            steps: [
              "Pause keywords with CTR < 1% and impressions > 500",
              "Test new headline variants with stronger value propositions",
              "Switch broad match keywords to phrase match to improve relevance",
              "Add negative keywords for irrelevant search terms",
            ],
          }),
          status: "PROPOSED",
        },
      });

      decisions.push({
        id: decision.id,
        decisionType: "bid_adjust",
        channel: "google_ads",
        rationale,
        action: "Improve Google Ads CTR via copy refresh and keyword pruning",
        before: { avgCtr: perf.avgCtr },
        after: { targetCtr: thresholds.minimum_ctr_percent },
      });

      console.log(`[ads-optimize] Created bid_adjust decision for google_ads CTR`);
    }
  }

  // 9. Build final summary
  const summary = {
    campaignId,
    campaignName: campaign.name,
    phase: "optimization",
    analysisWindow: "7 days",
    snapshotsAnalyzed: snapshots.length,
    channelPerformances: channelPerformances.map((p) => ({
      ...p,
      classification: classifications[p.channel],
      cpaVsTarget: thresholds.target_cpa_usd > 0
        ? `${Math.round((p.avgCpa / thresholds.target_cpa_usd) * 100)}% of target`
        : "N/A",
    })),
    thresholds,
    decisionsCreated: decisions.length,
    decisions,
    budgetReallocation: {
      changed: allocationChanged,
      before: currentAllocation,
      after: newAllocation,
    },
    nextPhase: "monitoring",
    cycleNote: "After applying optimizations, advance loop back to monitoring phase to track impact.",
  };

  console.log(`[ads-optimize] Optimization phase complete. ${decisions.length} decision(s) generated.`);
  return summary;
}

// ---------------------------------------------------------------------------
// CLI runner
// ---------------------------------------------------------------------------

if (require.main === module) {
  const campaignId =
    process.argv.find((a, i) => process.argv[i - 1] === "--campaignId") ?? "";

  runAdsOptimization(prisma, campaignId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
