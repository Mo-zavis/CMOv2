/**
 * ads-research.ts — Ads Loop: Research Phase
 *
 * Reads the campaign from DB and generates three structured research artifacts:
 *   1. Audience persona (persona)
 *   2. Keyword list (keyword_list)
 *   3. Competitor analysis (competitor_analysis)
 *
 * Usage:
 *   npx tsx scripts/pipelines/ads-research.ts --campaignId <id>
 */

import path from "path";

const dashboardPath = path.resolve(__dirname, "../../dashboard");
const { PrismaClient } = require(path.join(dashboardPath, "node_modules/@prisma/client"));
const dbPath = path.resolve(dashboardPath, "prisma/dev.db");
const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TargetingJSON {
  ageGroups?: string[];
  genders?: string[];
  locations?: string[];
  jobTitles?: string[];
  industries?: string[];
  audiences?: string[];
  [key: string]: unknown;
}

interface KeywordEntry {
  text: string;
  intent: "informational" | "navigational" | "transactional";
  estimated_volume: "high" | "medium" | "low";
  recommended_match_type: "exact" | "phrase" | "broad";
}

interface KeywordListData {
  primary_keywords: KeywordEntry[];
  long_tail_keywords: KeywordEntry[];
  negative_keywords: Array<{ text: string; reason: string }>;
}

interface PersonaData {
  name: string;
  role: string;
  demographics: {
    age_range: string;
    gender: string;
    locations: string[];
    job_titles: string[];
    industries: string[];
  };
  pain_points: string[];
  decision_making_factors: string[];
  preferred_platforms: string[];
  content_preferences: string[];
  motivations: string[];
  buying_journey_stage: string;
}

interface CompetitorData {
  competitors: Array<{
    name: string;
    likely_ad_strategies: string[];
    positioning: string;
  }>;
  positioning_gaps: string[];
  differentiation_angles: string[];
}

// ---------------------------------------------------------------------------
// Artifact generators
// ---------------------------------------------------------------------------

function buildPersona(targeting: TargetingJSON, objective: string): PersonaData {
  const jobTitles = targeting.jobTitles ?? [
    "Practice Manager",
    "Medical Director",
    "Healthcare Administrator",
    "Chief Medical Officer",
  ];

  const industries = targeting.industries ?? [
    "Healthcare",
    "Medical Practices",
    "Outpatient Clinics",
    "Specialty Care",
  ];

  const locations = targeting.locations ?? ["United States"];
  const ageGroups = targeting.ageGroups ?? ["35-54"];
  const audiences = targeting.audiences ?? ["decision makers", "healthcare operators"];

  const isRevenueFocused =
    objective.toLowerCase().includes("revenue") ||
    objective.toLowerCase().includes("demo") ||
    objective.toLowerCase().includes("book");

  const isNoShowFocused =
    objective.toLowerCase().includes("no-show") ||
    objective.toLowerCase().includes("attendance");

  const primaryPainPoint = isRevenueFocused
    ? "Losing significant revenue due to appointment gaps and low new-patient acquisition"
    : isNoShowFocused
    ? "High no-show rates destroying practice profitability and provider schedules"
    : "Struggling to retain patients and improve satisfaction scores";

  return {
    name: "Dr. Sarah Chen — The Growth-Minded Practice Leader",
    role: jobTitles[0] ?? "Practice Manager",
    demographics: {
      age_range: ageGroups[0] ?? "35-54",
      gender: "All genders",
      locations,
      job_titles: jobTitles as string[],
      industries: industries as string[],
    },
    pain_points: [
      primaryPainPoint,
      "Manual patient outreach is time-consuming and inconsistent",
      "EHR systems do not handle proactive patient engagement",
      "Staff are overwhelmed handling appointment reminders and follow-ups",
      "Difficulty measuring patient engagement ROI",
      "Competing with larger health systems that have bigger marketing budgets",
    ],
    decision_making_factors: [
      "ROI — measurable reduction in no-shows within 90 days",
      "EHR integration compatibility (Epic, Athena, Cerner)",
      "Ease of implementation and minimal IT lift",
      "HIPAA compliance and data security",
      "Case studies from similar-sized practices",
      "Transparent pricing with no long-term lock-in",
      "White-glove onboarding and ongoing support",
    ],
    preferred_platforms: ["LinkedIn", "Google Search", "Healthcare trade publications", "Email"],
    content_preferences: [
      "ROI calculators and benchmark reports",
      "Short video demos (under 2 minutes)",
      "Case studies with specific outcome numbers",
      "Peer testimonials from practice managers",
      "Webinars with CME credits",
    ],
    motivations: [
      "Demonstrable revenue growth to justify technology spend",
      "Freeing up staff time for higher-value tasks",
      "Improving patient experience and Google reviews",
      "Staying competitive in an increasingly AI-driven industry",
    ],
    buying_journey_stage: audiences.includes("retargeting") ? "consideration" : "awareness",
  };
}

function buildKeywordList(objective: string, targeting: TargetingJSON): KeywordListData {
  const isRevenueFocused = objective.toLowerCase().includes("revenue") || objective.toLowerCase().includes("demo");
  const isNoShowFocused = objective.toLowerCase().includes("no-show");

  const primaryKeywords: KeywordEntry[] = isRevenueFocused
    ? [
        { text: "patient engagement platform", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
        { text: "healthcare ai platform demo", intent: "transactional", estimated_volume: "medium", recommended_match_type: "exact" },
        { text: "medical practice automation software", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
        { text: "patient communication software", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
        { text: "healthcare patient engagement solution", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "automated patient outreach", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "increase medical practice revenue", intent: "informational", estimated_volume: "medium", recommended_match_type: "broad" },
        { text: "patient retention software healthcare", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
      ]
    : isNoShowFocused
    ? [
        { text: "reduce patient no shows", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
        { text: "appointment reminder software medical", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
        { text: "patient no show solutions", intent: "informational", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "automated appointment reminders healthcare", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
        { text: "medical practice no show reduction", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "healthcare scheduling automation", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "patient reminder system clinic", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "reduce no show rate medical office", intent: "transactional", estimated_volume: "low", recommended_match_type: "exact" },
      ]
    : [
        { text: "patient satisfaction software", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
        { text: "healthcare patient experience platform", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "medical practice management software", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
        { text: "patient engagement ai", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "improve patient satisfaction scores", intent: "informational", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "healthcare automation platform", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
        { text: "patient feedback system medical", intent: "transactional", estimated_volume: "low", recommended_match_type: "phrase" },
        { text: "outpatient engagement solution", intent: "transactional", estimated_volume: "low", recommended_match_type: "phrase" },
      ];

  const longTailKeywords: KeywordEntry[] = [
    { text: "zavis ai patient engagement platform", intent: "navigational", estimated_volume: "low", recommended_match_type: "exact" },
    { text: "how to reduce no shows in medical practice", intent: "informational", estimated_volume: "medium", recommended_match_type: "phrase" },
    { text: "patient engagement software for small medical practice", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
    { text: "best patient reminder software 2026", intent: "informational", estimated_volume: "high", recommended_match_type: "phrase" },
    { text: "hipaa compliant patient messaging platform", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
    { text: "ai powered patient outreach healthcare", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
    { text: "epic athena patient engagement integration", intent: "transactional", estimated_volume: "low", recommended_match_type: "phrase" },
    { text: "medical practice revenue increase ai", intent: "informational", estimated_volume: "low", recommended_match_type: "broad" },
    { text: "patient re-engagement campaigns healthcare", intent: "transactional", estimated_volume: "low", recommended_match_type: "phrase" },
    { text: "automated follow up system medical office", intent: "transactional", estimated_volume: "medium", recommended_match_type: "phrase" },
    { text: "healthcare practice growth software demo", intent: "transactional", estimated_volume: "low", recommended_match_type: "exact" },
    { text: "appointment reminder text message healthcare", intent: "transactional", estimated_volume: "high", recommended_match_type: "phrase" },
    { text: "patient care gap outreach automation", intent: "transactional", estimated_volume: "low", recommended_match_type: "phrase" },
    { text: "decrease missed appointments clinic", intent: "informational", estimated_volume: "medium", recommended_match_type: "phrase" },
    { text: "proactive patient communication platform", intent: "transactional", estimated_volume: "low", recommended_match_type: "phrase" },
  ];

  const negativeKeywords = [
    { text: "free", reason: "Attracts non-buyer traffic seeking free tools" },
    { text: "job", reason: "Job seekers, not buyers" },
    { text: "careers", reason: "Job seekers, not buyers" },
    { text: "ehr software", reason: "Different product category; causes irrelevant clicks" },
    { text: "patient portal", reason: "Matches different product intent" },
    { text: "telehealth", reason: "Different service vertical" },
    { text: "medical billing", reason: "Different product intent" },
    { text: "insurance", reason: "Attracts unrelated healthcare queries" },
    { text: "how to become", reason: "Educational queries, not buyer intent" },
    { text: "tutorial", reason: "Research-only intent" },
  ];

  return { primary_keywords: primaryKeywords, long_tail_keywords: longTailKeywords, negative_keywords: negativeKeywords };
}

function buildCompetitorAnalysis(targeting: TargetingJSON, objective: string): CompetitorData {
  void targeting;
  void objective;

  return {
    competitors: [
      {
        name: "Luma Health",
        likely_ad_strategies: [
          "Branded search terms with heavy CPC investment",
          "LinkedIn campaigns targeting practice administrators",
          "G2 review-driven trust signals in display ads",
          "Retargeting with ROI-focused messaging",
        ],
        positioning: "End-to-end patient access platform with strong telehealth angle",
      },
      {
        name: "Klara",
        likely_ad_strategies: [
          "Focus on EHR-native messaging angle",
          "Search ads for 'patient communication' terms",
          "Content marketing via healthcare blogs and webinars",
          "Partnership with Athena and Epic marketplaces",
        ],
        positioning: "Conversational patient engagement platform with EHR-first integration",
      },
      {
        name: "Relatient",
        likely_ad_strategies: [
          "Strong Google Search presence for appointment reminder terms",
          "Healthcare trade show presence and sponsored content",
          "Target hospital systems and large practice groups",
          "ROI case study campaigns",
        ],
        positioning: "Patient scheduling and engagement for large health systems",
      },
      {
        name: "Phreesia",
        likely_ad_strategies: [
          "Dominant display presence on healthcare publisher sites",
          "LinkedIn thought leadership for executive buyers",
          "Extensive case study and whitepaper content programs",
          "Heavy retargeting to long sales cycle prospects",
        ],
        positioning: "Patient intake and activation platform for enterprise health systems",
      },
      {
        name: "Solutionreach",
        likely_ad_strategies: [
          "Search ads targeting small-to-mid practice terms",
          "Price-comparison angle vs. competitors",
          "Video testimonial campaigns on Facebook and YouTube",
          "Local search optimization for practice-level targeting",
        ],
        positioning: "Patient relationship management for independent practices",
      },
    ],
    positioning_gaps: [
      "None of the primary competitors lead with AI-native intelligence. Zavis can own the 'AI-first patient engagement' position.",
      "Competitors focus on communication features, not revenue outcomes. Zavis can lead with a revenue guarantee narrative.",
      "No competitor offers a clear 90-day ROI promise with transparent benchmarks.",
      "The mid-market gap: enterprise platforms ignore smaller practices; SMB tools lack intelligence. Zavis bridges this.",
      "Competitors underinvest in patient satisfaction as a primary pillar, focusing only on operational metrics.",
    ],
    differentiation_angles: [
      "AI that learns your patient panel and predicts no-shows before they happen",
      "The only patient engagement platform built around three measurable outcomes: revenue, attendance, satisfaction",
      "HIPAA-native AI with zero-setup EHR integration in under 14 days",
      "Transparent ROI dashboard: see exactly what Zavis earned you this month",
      "Healthcare-specific AI trained on millions of patient interactions, not repurposed general AI",
    ],
  };
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runAdsResearch(prisma: any, campaignId: string): Promise<object> {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }

  console.log(`[ads-research] Starting research phase for campaign: ${campaignId}`);

  // 1. Read campaign from DB
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  console.log(`[ads-research] Campaign: "${campaign.name}"`);
  console.log(`[ads-research] Objective: ${campaign.objective ?? "(none)"}`);

  const targeting: TargetingJSON = campaign.targeting ? JSON.parse(campaign.targeting) : {};
  const objective = campaign.objective ?? "";

  // Find or create the Zavis project
  let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
  if (!project) {
    project = await prisma.project.create({ data: { name: "Zavis" } });
    console.log(`[ads-research] Created Zavis project: ${project.id}`);
  }

  const artifactIds: Record<string, string> = {};

  // ---------------------------------------------------------------------------
  // 2a. Persona
  // ---------------------------------------------------------------------------
  console.log("[ads-research] Generating audience persona...");
  const personaData = buildPersona(targeting, objective);

  const personaArtifact = await prisma.researchArtifact.create({
    data: {
      projectId: project.id,
      campaignId,
      artifactType: "persona",
      title: `Audience Persona — ${campaign.name}`,
      data: JSON.stringify(personaData),
      source: "zavis-cmo-pipeline:ads-research",
    },
  });

  artifactIds.persona = personaArtifact.id;
  console.log(`[ads-research] Persona saved: ${personaArtifact.id}`);

  // ---------------------------------------------------------------------------
  // 2b. Keyword List
  // ---------------------------------------------------------------------------
  console.log("[ads-research] Generating keyword list...");
  const keywordData = buildKeywordList(objective, targeting);

  const keywordArtifact = await prisma.researchArtifact.create({
    data: {
      projectId: project.id,
      campaignId,
      artifactType: "keyword_list",
      title: `Keyword List — ${campaign.name}`,
      data: JSON.stringify(keywordData),
      source: "zavis-cmo-pipeline:ads-research",
    },
  });

  artifactIds.keyword_list = keywordArtifact.id;
  console.log(`[ads-research] Keyword list saved: ${keywordArtifact.id}`);

  // ---------------------------------------------------------------------------
  // 2c. Competitor Analysis
  // ---------------------------------------------------------------------------
  console.log("[ads-research] Generating competitor analysis...");
  const competitorData = buildCompetitorAnalysis(targeting, objective);

  const competitorArtifact = await prisma.researchArtifact.create({
    data: {
      projectId: project.id,
      campaignId,
      artifactType: "competitor_analysis",
      title: `Competitor Analysis — ${campaign.name}`,
      data: JSON.stringify(competitorData),
      source: "zavis-cmo-pipeline:ads-research",
    },
  });

  artifactIds.competitor_analysis = competitorArtifact.id;
  console.log(`[ads-research] Competitor analysis saved: ${competitorArtifact.id}`);

  // ---------------------------------------------------------------------------
  // 3. Return summary
  // ---------------------------------------------------------------------------
  const summary = {
    campaignId,
    campaignName: campaign.name,
    phase: "research",
    artifactIds,
    keyFindings: {
      primaryPersonaRole: personaData.role,
      topPainPoints: personaData.pain_points.slice(0, 3),
      primaryKeywordsCount: keywordData.primary_keywords.length,
      longTailKeywordsCount: keywordData.long_tail_keywords.length,
      negativeKeywordsCount: keywordData.negative_keywords.length,
      competitorsAnalyzed: competitorData.competitors.length,
      topDifferentiationAngle: competitorData.differentiation_angles[0],
      keyPositioningGap: competitorData.positioning_gaps[0],
    },
    nextPhase: "planning",
  };

  console.log("[ads-research] Research phase complete.");
  return summary;
}

// ---------------------------------------------------------------------------
// CLI runner
// ---------------------------------------------------------------------------

if (require.main === module) {
  const campaignId =
    process.argv.find((a, i) => process.argv[i - 1] === "--campaignId") ?? "";

  runAdsResearch(prisma, campaignId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
