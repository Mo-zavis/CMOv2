/**
 * ads-create.ts — Ads Loop: Creation Phase
 *
 * Reads the campaign plan from the latest planning phase log, then creates:
 *   - AdGroup records for each planned ad group
 *   - AdCreative records for each group
 *   - Asset records (type="ad_creative") for each creative
 *   - CalendarEvent entries for planned launch dates
 *
 * Usage:
 *   npx tsx scripts/pipelines/ads-create.ts --campaignId <id>
 */

import path from "path";

const dashboardPath = path.resolve(__dirname, "../../dashboard");
const { PrismaClient } = require(path.join(dashboardPath, "node_modules/@prisma/client"));
const dbPath = path.resolve(dashboardPath, "prisma/dev.db");
const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
}

interface CampaignPlan {
  campaignId: string;
  campaignName: string;
  totalBudget: number;
  planGeneratedAt: string;
  channelAllocation: Array<{ channel: string; budget_percent: number; daily_budget_usd: number }>;
  adGroupStructure: AdGroupPlan[];
  creativeFormatsPerPlatform: Record<string, string[]>;
  performanceThresholds: PerformanceThresholds;
  launchDate: string;
  reviewMilestones: Array<{ dayOffset: number; action: string }>;
}

// ---------------------------------------------------------------------------
// Creative copy templates per platform/format
// ---------------------------------------------------------------------------

const creativeTemplates: Record<
  string,
  Array<{
    headline: string;
    description: string;
    cta: string;
    format: string;
  }>
> = {
  google_revenue: [
    {
      headline: "Grow Your Practice Revenue with AI",
      description: "Zavis AI identifies revenue gaps and re-engages patients automatically. See 20% more bookings in 90 days.",
      cta: "Book a Demo",
      format: "responsive_search",
    },
    {
      headline: "Stop Losing Revenue to Empty Appointment Slots",
      description: "AI-powered patient engagement that fills your schedule and reduces cancellations. HIPAA-compliant and EHR-ready.",
      cta: "Get a Free Demo",
      format: "responsive_search",
    },
    {
      headline: "AI Patient Engagement That Pays for Itself",
      description: "Practices using Zavis see an average $40,000 in recovered annual revenue. No long-term contracts.",
      cta: "See the ROI",
      format: "responsive_search",
    },
  ],
  google_noshows: [
    {
      headline: "Reduce Patient No-Shows by Up to 40%",
      description: "Zavis AI predicts and prevents missed appointments with intelligent, personalized outreach. Integrates with your EHR.",
      cta: "Start Free Trial",
      format: "responsive_search",
    },
    {
      headline: "Automated Appointment Reminders That Actually Work",
      description: "Smart multi-channel reminders via text, email, and voice. Reduce no-shows and protect your revenue.",
      cta: "Book a Demo",
      format: "responsive_search",
    },
    {
      headline: "AI That Fills Your Schedule Before No-Shows Happen",
      description: "Predict which patients will miss appointments and engage them proactively. See results in 30 days.",
      cta: "Get Started",
      format: "responsive_search",
    },
  ],
  google_platform: [
    {
      headline: "Patient Engagement Platform for Modern Healthcare",
      description: "AI-powered communication, scheduling, and analytics. Built for practices that want to grow. HIPAA-native.",
      cta: "Book a Demo",
      format: "responsive_search",
    },
    {
      headline: "The AI Platform Built for Patient Engagement",
      description: "From missed appointments to care gaps, Zavis handles it all. Trusted by 500+ practices nationwide.",
      cta: "See It in Action",
      format: "responsive_search",
    },
  ],
  meta_awareness: [
    {
      headline: "Is Your Practice Leaving Revenue on the Table?",
      description: "The average practice loses $120,000 annually to no-shows and disengaged patients. Zavis AI fixes that.",
      cta: "Learn More",
      format: "single_image",
    },
    {
      headline: "How Top Practices Are Using AI to Grow Revenue",
      description: "See how Zavis helps healthcare practices increase revenue, reduce no-shows, and improve patient satisfaction.",
      cta: "Watch Demo",
      format: "single_image",
    },
    {
      headline: "Patient Engagement That Runs Itself",
      description: "Zavis AI handles outreach, reminders, and follow-ups so your team can focus on patient care.",
      cta: "Get a Free Demo",
      format: "carousel",
    },
  ],
  meta_retargeting: [
    {
      headline: "Still Thinking About Zavis?",
      description: "Join 500+ practices using AI to grow revenue and reduce no-shows. Book a personalized demo today.",
      cta: "Book Your Demo",
      format: "single_image",
    },
    {
      headline: "See Exactly What Zavis Would Mean for Your Practice",
      description: "Get a custom ROI estimate in 10 minutes. No commitment. No sales pressure.",
      cta: "Calculate Your ROI",
      format: "single_image",
    },
  ],
  linkedin_executive: [
    {
      headline: "The AI Platform Healthcare Executives Trust for Growth",
      description: "Zavis AI turns patient data into revenue opportunities. See measurable outcomes within 90 days or your money back.",
      cta: "Request a Demo",
      format: "single_image",
    },
    {
      headline: "Reduce Patient No-Shows. Increase Practice Revenue.",
      description: "Zavis is the only AI-native patient engagement platform built around measurable outcomes for healthcare operators.",
      cta: "Learn More",
      format: "carousel",
    },
  ],
  linkedin_admin: [
    {
      headline: "Automate Patient Outreach Without Adding Headcount",
      description: "Zavis handles appointment reminders, care gap outreach, and re-engagement campaigns on autopilot.",
      cta: "Book a Demo",
      format: "single_image",
    },
  ],
  default: [
    {
      headline: "AI-Powered Patient Engagement by Zavis",
      description: "Increase revenue, reduce no-shows, and improve patient satisfaction with intelligent automation.",
      cta: "Book a Demo",
      format: "single_image",
    },
  ],
};

function getCreativesForGroup(group: AdGroupPlan): Array<{
  headline: string;
  description: string;
  cta: string;
  format: string;
}> {
  const name = group.name.toLowerCase();

  if (name.includes("revenue")) return creativeTemplates.google_revenue;
  if (name.includes("no-show") || name.includes("noshows") || name.includes("reduction"))
    return creativeTemplates.google_noshows;
  if (name.includes("platform") || name.includes("engagement")) return creativeTemplates.google_platform;
  if (name.includes("awareness")) return creativeTemplates.meta_awareness;
  if (name.includes("retarget")) return creativeTemplates.meta_retargeting;
  if (name.includes("executive")) return creativeTemplates.linkedin_executive;
  if (name.includes("administrator") || name.includes("admin")) return creativeTemplates.linkedin_admin;

  return creativeTemplates.default;
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runAdsCreation(prisma: any, campaignId: string): Promise<object> {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }

  console.log(`[ads-create] Starting creation phase for campaign: ${campaignId}`);

  // 1. Read campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  console.log(`[ads-create] Campaign: "${campaign.name}"`);

  // 2. Find project
  let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
  if (!project) {
    project = await prisma.project.create({ data: { name: "Zavis" } });
  }

  // 3. Read the plan from the latest planning phase log
  const activeLoop = await prisma.loopExecution.findFirst({
    where: { campaignId, loopType: "ads", status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });

  let plan: CampaignPlan | null = null;

  if (activeLoop) {
    const planningLog = await prisma.loopPhaseLog.findFirst({
      where: {
        loopExecutionId: activeLoop.id,
        phase: "planning",
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (planningLog?.output) {
      try {
        const logOutput = JSON.parse(planningLog.output);
        // The planning phase stores the full summary object: { plan: CampaignPlan, ... }
        // Fall back to treating the output itself as the plan if no nested `plan` key.
        plan = (logOutput.plan ?? logOutput) as CampaignPlan;
        console.log(`[ads-create] Loaded plan from loop phase log: ${planningLog.id}`);
      } catch {
        console.warn("[ads-create] Could not parse plan from phase log. Using defaults.");
      }
    }
  }

  // Fall back to a basic structure if no plan found
  if (!plan) {
    console.warn("[ads-create] No planning phase log found. Using default ad group structure.");
    const channels: string[] = campaign.channels ? JSON.parse(campaign.channels) : ["google_ads", "meta_ads"];
    const hasGoogle = channels.some((c: string) => c.includes("google"));
    const hasMeta = channels.some((c: string) => c.includes("meta"));

    const adGroupStructure: AdGroupPlan[] = [];
    if (hasGoogle) {
      adGroupStructure.push({
        name: "Google Search — Patient Engagement",
        platform: "google_ads",
        adType: "search",
        targeting_focus: "Core patient engagement terms",
        creative_formats: ["responsive_search"],
        keywords_theme: "patient engagement, appointment reminders, healthcare automation",
        daily_budget_usd: 50,
        bid_strategy: "maximize_conversions",
      });
    }
    if (hasMeta) {
      adGroupStructure.push({
        name: "Meta — Practice Managers",
        platform: "meta_ads",
        adType: "feed",
        targeting_focus: "Practice managers and healthcare administrators",
        creative_formats: ["single_image", "carousel"],
        keywords_theme: "N/A",
        daily_budget_usd: 30,
        bid_strategy: "lowest_cost",
      });
    }
    plan = {
      campaignId,
      campaignName: campaign.name,
      totalBudget: campaign.budget ?? 5000,
      planGeneratedAt: new Date().toISOString(),
      channelAllocation: [],
      adGroupStructure,
      creativeFormatsPerPlatform: {},
      performanceThresholds: {
        target_cpa_usd: 35,
        minimum_ctr_percent: 2.5,
        target_roas: 3.5,
        max_cpc_usd: 10,
        minimum_conversion_rate_percent: 3.0,
      },
      launchDate: campaign.startDate
        ? campaign.startDate.toISOString().slice(0, 10)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      reviewMilestones: [],
    };
  }

  // 4. Get existing ad groups to avoid duplicates
  const existingAdGroups = await prisma.adGroup.findMany({
    where: { campaignId },
    select: { id: true, name: true },
  });
  const existingAdGroupNames = new Set(existingAdGroups.map((g: { name: string }) => g.name));

  const createdAdGroups: Array<{ id: string; name: string; platform: string }> = [];
  const createdCreatives: Array<{ id: string; headline: string; adGroupName: string }> = [];
  const createdAssets: Array<{ id: string; title: string }> = [];
  const createdEvents: Array<{ id: string; title: string }> = [];

  // 5. Create AdGroup records
  for (const groupPlan of plan.adGroupStructure) {
    if (existingAdGroupNames.has(groupPlan.name)) {
      console.log(`[ads-create] Ad group already exists: "${groupPlan.name}" — skipping`);
      const existing = existingAdGroups.find((g: { name: string; id: string }) => g.name === groupPlan.name);
      if (existing) createdAdGroups.push({ id: existing.id, name: existing.name, platform: groupPlan.platform });
      continue;
    }

    console.log(`[ads-create] Creating ad group: "${groupPlan.name}"`);

    const keywords: Array<{ keyword: string; matchType: string; bid: number }> = [];
    if (groupPlan.platform === "google_ads" && groupPlan.keywords_theme !== "N/A") {
      const terms = groupPlan.keywords_theme.split(",").map((t) => t.trim()).filter(Boolean);
      for (const term of terms) {
        keywords.push({ keyword: term, matchType: "phrase", bid: groupPlan.daily_budget_usd * 0.1 });
      }
    }

    const adGroup = await prisma.adGroup.create({
      data: {
        campaignId,
        name: groupPlan.name,
        platform: groupPlan.platform,
        adType: groupPlan.adType,
        targeting: JSON.stringify({ targeting_focus: groupPlan.targeting_focus }),
        keywords: keywords.length > 0 ? JSON.stringify(keywords) : null,
        budget: groupPlan.daily_budget_usd * 30,
        bidStrategy: groupPlan.bid_strategy,
        status: "DRAFT",
      },
    });

    createdAdGroups.push({ id: adGroup.id, name: adGroup.name, platform: groupPlan.platform });
    console.log(`[ads-create] Created ad group: ${adGroup.id}`);

    // 6. Create AdCreative records for each group
    const creativeTemplateList = getCreativesForGroup(groupPlan);

    for (const tmpl of creativeTemplateList) {
      // 6a. Create the Asset record
      const assetTitle = `${groupPlan.name} — ${tmpl.headline}`;

      const asset = await prisma.asset.create({
        data: {
          projectId: project.id,
          campaignId,
          type: "ad_creative",
          subtype: tmpl.format,
          platform: groupPlan.platform,
          title: assetTitle,
          description: tmpl.description,
          status: "DRAFT",
          currentVersion: 1,
          metadata: JSON.stringify({
            generatedBy: "zavis-cmo-pipeline:ads-create",
            adGroupId: adGroup.id,
            format: tmpl.format,
            cta: tmpl.cta,
          }),
        },
      });

      // Create initial version
      await prisma.assetVersion.create({
        data: {
          assetId: asset.id,
          version: 1,
          content: JSON.stringify({
            headline: tmpl.headline,
            description: tmpl.description,
            cta: tmpl.cta,
            format: tmpl.format,
          }),
          changelog: "Initial generation from ads-create pipeline",
          metadata: JSON.stringify({ generatedBy: "zavis-cmo-pipeline:ads-create" }),
        },
      });

      createdAssets.push({ id: asset.id, title: assetTitle });

      // 6b. Create the AdCreative record
      const creative = await prisma.adCreative.create({
        data: {
          adGroupId: adGroup.id,
          headline: tmpl.headline,
          description: tmpl.description,
          cta: tmpl.cta,
          format: tmpl.format,
          landingUrl: "https://zavis.ai/demo",
          copyAssetId: asset.id,
          utmParams: JSON.stringify({
            utm_source: groupPlan.platform,
            utm_medium: "paid",
            utm_campaign: campaign.name.toLowerCase().replace(/\s+/g, "_"),
            utm_content: tmpl.format,
          }),
          status: "DRAFT",
        },
      });

      createdCreatives.push({ id: creative.id, headline: tmpl.headline, adGroupName: groupPlan.name });
      console.log(`[ads-create] Created creative: "${tmpl.headline}"`);
    }
  }

  // 7. Create CalendarEvent entries for launch and review milestones
  const launchDate = new Date(plan.launchDate);

  // Launch event
  const launchEvent = await prisma.calendarEvent.create({
    data: {
      projectId: project.id,
      title: `Campaign Launch: ${campaign.name}`,
      description: `Paid ads campaign launches across ${plan.adGroupStructure.length} ad groups on ${plan.channelAllocation.map((c) => c.channel).join(", ")}`,
      date: launchDate,
      eventType: "campaign_launch",
      campaignId,
      status: "PLANNED",
      metadata: JSON.stringify({ generatedBy: "ads-create", adGroupCount: plan.adGroupStructure.length }),
    },
  });

  createdEvents.push({ id: launchEvent.id, title: launchEvent.title });

  // Milestone events
  for (const milestone of plan.reviewMilestones ?? []) {
    const milestoneDate = new Date(launchDate.getTime() + milestone.dayOffset * 24 * 60 * 60 * 1000);
    const milestoneEvent = await prisma.calendarEvent.create({
      data: {
        projectId: project.id,
        title: `Campaign Review (Day ${milestone.dayOffset}): ${campaign.name}`,
        description: milestone.action,
        date: milestoneDate,
        eventType: "milestone",
        campaignId,
        status: "PLANNED",
        metadata: JSON.stringify({ dayOffset: milestone.dayOffset, generatedBy: "ads-create" }),
      },
    });
    createdEvents.push({ id: milestoneEvent.id, title: milestoneEvent.title });
  }

  console.log(`[ads-create] Created ${createdEvents.length} calendar events.`);

  const summary = {
    campaignId,
    campaignName: campaign.name,
    phase: "creation",
    created: {
      adGroups: createdAdGroups.length,
      creatives: createdCreatives.length,
      assets: createdAssets.length,
      calendarEvents: createdEvents.length,
    },
    adGroups: createdAdGroups,
    assets: createdAssets.map((a) => a.id),
    calendarEvents: createdEvents,
    nextPhase: "deployment",
  };

  console.log("[ads-create] Creation phase complete.");
  return summary;
}

// ---------------------------------------------------------------------------
// CLI runner
// ---------------------------------------------------------------------------

if (require.main === module) {
  const campaignId =
    process.argv.find((a, i) => process.argv[i - 1] === "--campaignId") ?? "";

  runAdsCreation(prisma, campaignId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
