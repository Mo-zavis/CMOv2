/**
 * ads-plan.ts — Ads Loop: Planning Phase
 *
 * Reads the campaign and its research artifacts, then generates a structured
 * campaign plan with budget allocation, ad group structure, creative formats,
 * performance thresholds, and monitoring schedule.
 *
 * Usage:
 *   npx tsx scripts/pipelines/ads-plan.ts --campaignId <id>
 */

import path from "path";

const dashboardPath = path.resolve(__dirname, "../../dashboard");
const { PrismaClient } = require(path.join(dashboardPath, "node_modules/@prisma/client"));
const dbPath = path.resolve(dashboardPath, "prisma/dev.db");
const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChannelConfig {
  channel: string;
  budget_percent: number;
  daily_budget_usd: number;
  rationale: string;
}

interface AdGroupPlan {
  name: string;
  platform: string;
  adType: string;
  targeting_focus: string;
  creative_formats: string[];
  keywords_theme: string;
  daily_budget_usd: number;
  bid_strategy: string;
}

interface PerformanceThresholds {
  target_cpa_usd: number;
  minimum_ctr_percent: number;
  target_roas: number;
  max_cpc_usd: number;
  minimum_conversion_rate_percent: number;
  pause_cpa_multiplier: number;
}

interface MonitoringSchedule {
  first_two_weeks: string;
  ongoing: string;
  optimization_trigger: string;
  alert_thresholds: {
    cpa_spike_percent: number;
    ctr_drop_percent: number;
    spend_deviation_percent: number;
  };
}

interface CampaignPlan {
  campaignId: string;
  campaignName: string;
  totalBudget: number;
  planGeneratedAt: string;
  channelAllocation: ChannelConfig[];
  adGroupStructure: AdGroupPlan[];
  creativeFormatsPerPlatform: Record<string, string[]>;
  performanceThresholds: PerformanceThresholds;
  monitoringSchedule: MonitoringSchedule;
  launchDate: string;
  reviewMilestones: Array<{ dayOffset: number; action: string }>;
}

// ---------------------------------------------------------------------------
// Plan builder
// ---------------------------------------------------------------------------

function buildCampaignPlan(
  campaign: {
    id: string;
    name: string;
    objective: string | null;
    budget: number | null;
    channels: string | null;
    kpis: string | null;
    targeting: string | null;
    startDate: Date | null;
  },
  researchArtifacts: Array<{ artifactType: string; data: string }>
): CampaignPlan {
  const totalBudget = campaign.budget ?? 5000;
  const channels: string[] = campaign.channels ? JSON.parse(campaign.channels) : ["google_ads", "meta_ads"];
  const kpis = campaign.kpis ? JSON.parse(campaign.kpis) : {};

  // Determine channel mix based on what's configured
  const hasGoogle = channels.some((c: string) => c.includes("google"));
  const hasMeta = channels.some((c: string) => c.includes("meta") || c.includes("facebook"));
  const hasLinkedIn = channels.some((c: string) => c.includes("linkedin"));

  // Build channel allocation
  const channelAllocation: ChannelConfig[] = [];

  if (hasGoogle && hasMeta && !hasLinkedIn) {
    channelAllocation.push(
      {
        channel: "google_ads",
        budget_percent: 60,
        daily_budget_usd: Math.round((totalBudget * 0.6) / 30),
        rationale: "High-intent search traffic captures active buyers researching patient engagement solutions",
      },
      {
        channel: "meta_ads",
        budget_percent: 40,
        daily_budget_usd: Math.round((totalBudget * 0.4) / 30),
        rationale: "Broad audience targeting and retargeting for awareness and nurture stages",
      }
    );
  } else if (hasGoogle && hasLinkedIn && !hasMeta) {
    channelAllocation.push(
      {
        channel: "google_ads",
        budget_percent: 55,
        daily_budget_usd: Math.round((totalBudget * 0.55) / 30),
        rationale: "Captures high-intent search buyers at the bottom of the funnel",
      },
      {
        channel: "linkedin_ads",
        budget_percent: 45,
        daily_budget_usd: Math.round((totalBudget * 0.45) / 30),
        rationale: "B2B targeting of practice managers and healthcare executives by job title",
      }
    );
  } else if (hasGoogle && hasMeta && hasLinkedIn) {
    channelAllocation.push(
      {
        channel: "google_ads",
        budget_percent: 50,
        daily_budget_usd: Math.round((totalBudget * 0.5) / 30),
        rationale: "Primary driver of high-intent conversions via search",
      },
      {
        channel: "meta_ads",
        budget_percent: 30,
        daily_budget_usd: Math.round((totalBudget * 0.3) / 30),
        rationale: "Awareness and retargeting for mid-funnel prospects",
      },
      {
        channel: "linkedin_ads",
        budget_percent: 20,
        daily_budget_usd: Math.round((totalBudget * 0.2) / 30),
        rationale: "Precision B2B targeting for executive and administrator personas",
      }
    );
  } else {
    // Default: Google only
    channelAllocation.push({
      channel: "google_ads",
      budget_percent: 100,
      daily_budget_usd: Math.round(totalBudget / 30),
      rationale: "Single channel focus maximizes efficiency and simplifies optimization",
    });
  }

  // Build ad group structure based on Zavis's three pillars
  const adGroupStructure: AdGroupPlan[] = [];

  const googleBudgetPerGroup = hasGoogle
    ? Math.round(
        (channelAllocation.find((c) => c.channel === "google_ads")?.daily_budget_usd ?? 100) / 3
      )
    : 0;

  const metaBudgetPerGroup = hasMeta
    ? Math.round(
        (channelAllocation.find((c) => c.channel === "meta_ads")?.daily_budget_usd ?? 50) / 2
      )
    : 0;

  if (hasGoogle) {
    adGroupStructure.push(
      {
        name: "Google Search — Revenue Growth",
        platform: "google_ads",
        adType: "search",
        targeting_focus: "High-intent terms around practice revenue and patient acquisition",
        creative_formats: ["responsive_search"],
        keywords_theme: "increase medical practice revenue, patient acquisition software, grow healthcare practice",
        daily_budget_usd: googleBudgetPerGroup,
        bid_strategy: "maximize_conversions",
      },
      {
        name: "Google Search — No-Show Reduction",
        platform: "google_ads",
        adType: "search",
        targeting_focus: "Terms around appointment no-shows and reminder automation",
        creative_formats: ["responsive_search"],
        keywords_theme: "reduce patient no shows, automated appointment reminders, patient recall system",
        daily_budget_usd: googleBudgetPerGroup,
        bid_strategy: "maximize_conversions",
      },
      {
        name: "Google Search — Patient Engagement Platform",
        platform: "google_ads",
        adType: "search",
        targeting_focus: "Broad patient engagement and communication platform terms",
        creative_formats: ["responsive_search"],
        keywords_theme: "patient engagement platform, patient communication software, healthcare automation",
        daily_budget_usd: googleBudgetPerGroup,
        bid_strategy: "target_cpa",
      }
    );
  }

  if (hasMeta) {
    adGroupStructure.push(
      {
        name: "Meta — Practice Manager Awareness",
        platform: "meta_ads",
        adType: "feed",
        targeting_focus: "Practice managers and healthcare administrators aged 35-54",
        creative_formats: ["single_image", "carousel"],
        keywords_theme: "N/A — Meta uses interest and demographic targeting",
        daily_budget_usd: metaBudgetPerGroup,
        bid_strategy: "lowest_cost",
      },
      {
        name: "Meta — Retargeting Warm Audiences",
        platform: "meta_ads",
        adType: "feed",
        targeting_focus: "Website visitors and video viewers who did not convert",
        creative_formats: ["single_image", "video"],
        keywords_theme: "N/A — Retargeting pixel audiences",
        daily_budget_usd: metaBudgetPerGroup,
        bid_strategy: "lowest_cost",
      }
    );
  }

  if (hasLinkedIn) {
    const linkedInBudget = Math.round(
      (channelAllocation.find((c) => c.channel === "linkedin_ads")?.daily_budget_usd ?? 50) / 2
    );
    adGroupStructure.push(
      {
        name: "LinkedIn — Executive Targeting",
        platform: "linkedin_ads",
        adType: "feed",
        targeting_focus: "C-suite, Medical Directors, and VP roles in healthcare",
        creative_formats: ["single_image", "carousel"],
        keywords_theme: "N/A — LinkedIn uses job function and seniority targeting",
        daily_budget_usd: linkedInBudget,
        bid_strategy: "target_cpa",
      },
      {
        name: "LinkedIn — Practice Administrator Targeting",
        platform: "linkedin_ads",
        adType: "feed",
        targeting_focus: "Practice managers, administrators, and operations leaders",
        creative_formats: ["single_image"],
        keywords_theme: "N/A — LinkedIn uses job title targeting",
        daily_budget_usd: linkedInBudget,
        bid_strategy: "maximize_clicks",
      }
    );
  }

  // Creative formats per platform
  const creativeFormatsPerPlatform: Record<string, string[]> = {};
  if (hasGoogle) creativeFormatsPerPlatform.google_ads = ["responsive_search", "responsive_display"];
  if (hasMeta) creativeFormatsPerPlatform.meta_ads = ["single_image", "carousel", "video", "stories"];
  if (hasLinkedIn) creativeFormatsPerPlatform.linkedin_ads = ["single_image", "carousel", "video"];

  // Derive thresholds from KPIs or use intelligent defaults
  const targetCpa = kpis.target_cpa ?? kpis.cac ?? 35;
  const targetRoas = kpis.target_roas ?? kpis.roas ?? 3.5;

  const performanceThresholds: PerformanceThresholds = {
    target_cpa_usd: targetCpa,
    minimum_ctr_percent: 2.5,
    target_roas: targetRoas,
    max_cpc_usd: Math.round(targetCpa * 0.3),
    minimum_conversion_rate_percent: 3.0,
    pause_cpa_multiplier: 2.0,
  };

  // Monitoring schedule
  const monitoringSchedule: MonitoringSchedule = {
    first_two_weeks: "Check every 3 days — adjust bids, pause high-CPA keywords, expand performing terms",
    ongoing: "Weekly review every Monday — budget reallocation, creative refresh triggers, audience expansion",
    optimization_trigger: "Trigger optimization phase when CPA exceeds target by 40% for 5+ days or CTR drops 30% week-over-week",
    alert_thresholds: {
      cpa_spike_percent: 40,
      ctr_drop_percent: 30,
      spend_deviation_percent: 20,
    },
  };

  // Launch and milestone dates
  const launchDate = campaign.startDate
    ? campaign.startDate.toISOString().slice(0, 10)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const reviewMilestones = [
    { dayOffset: 3, action: "Initial performance sanity check — confirm tracking is firing, ads are approved" },
    { dayOffset: 7, action: "First week review — identify any budget-draining keywords, validate CTR baselines" },
    { dayOffset: 14, action: "Two-week review — pause underperformers, increase budget on winning ad groups" },
    { dayOffset: 30, action: "Month 1 review — full CPA analysis, creative fatigue check, audience expansion" },
    { dayOffset: 60, action: "Month 2 review — ROAS review, bid strategy adjustment, lookalike audience creation" },
    { dayOffset: 90, action: "Quarter review — full campaign audit, budget reallocation, next cycle planning" },
  ];

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    totalBudget,
    planGeneratedAt: new Date().toISOString(),
    channelAllocation,
    adGroupStructure,
    creativeFormatsPerPlatform,
    performanceThresholds,
    monitoringSchedule,
    launchDate,
    reviewMilestones,
  };
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runAdsPlanning(prisma: any, campaignId: string): Promise<object> {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }

  console.log(`[ads-plan] Starting planning phase for campaign: ${campaignId}`);

  // 1. Read campaign from DB
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  console.log(`[ads-plan] Campaign: "${campaign.name}"`);

  // 2. Read research artifacts
  const researchArtifacts = await prisma.researchArtifact.findMany({
    where: {
      campaignId,
      artifactType: { in: ["persona", "keyword_list", "competitor_analysis"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (researchArtifacts.length === 0) {
    console.warn("[ads-plan] No research artifacts found. Run ads-research phase first for best results.");
  } else {
    console.log(`[ads-plan] Found ${researchArtifacts.length} research artifacts.`);
  }

  // 3. Build the plan
  console.log("[ads-plan] Building campaign plan...");
  const plan = buildCampaignPlan(campaign, researchArtifacts);

  // 4. Find the active loop for this campaign and log the plan as phase output
  const activeLoop = await prisma.loopExecution.findFirst({
    where: {
      campaignId,
      loopType: "ads",
      status: "ACTIVE",
    },
    orderBy: { updatedAt: "desc" },
  });

  if (activeLoop) {
    await prisma.loopPhaseLog.updateMany({
      where: {
        loopExecutionId: activeLoop.id,
        phase: "planning",
        status: "IN_PROGRESS",
      },
      data: {
        output: JSON.stringify(plan),
        decisions: JSON.stringify({
          channelCount: plan.channelAllocation.length,
          adGroupCount: plan.adGroupStructure.length,
          totalBudget: plan.totalBudget,
          targetCpa: plan.performanceThresholds.target_cpa_usd,
          launchDate: plan.launchDate,
        }),
      },
    });

    console.log(`[ads-plan] Plan logged to loop phase log for loop: ${activeLoop.id}`);
  } else {
    console.warn("[ads-plan] No active ads loop found for this campaign. Plan was not logged to a loop phase log.");
  }

  const summary = {
    campaignId,
    campaignName: campaign.name,
    phase: "planning",
    plan,
    summary: {
      totalBudget: plan.totalBudget,
      channelsPlanned: plan.channelAllocation.map((c) => c.channel),
      adGroupsPlanned: plan.adGroupStructure.length,
      launchDate: plan.launchDate,
      targetCpaUsd: plan.performanceThresholds.target_cpa_usd,
      targetRoas: plan.performanceThresholds.target_roas,
    },
    nextPhase: "creation",
  };

  console.log("[ads-plan] Planning phase complete.");
  return summary;
}

// ---------------------------------------------------------------------------
// CLI runner
// ---------------------------------------------------------------------------

if (require.main === module) {
  const campaignId =
    process.argv.find((a, i) => process.argv[i - 1] === "--campaignId") ?? "";

  runAdsPlanning(prisma, campaignId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
