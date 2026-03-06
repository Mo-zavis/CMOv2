/**
 * ads-deploy.ts — Ads Loop: Deployment Phase
 *
 * Checks approval status of campaign assets, verifies platform credentials,
 * updates campaign status to ACTIVE, and creates monitoring calendar events.
 *
 * Usage:
 *   npx tsx scripts/pipelines/ads-deploy.ts --campaignId <id>
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
  // First check process.env
  if (process.env[name]) return process.env[name] as string;

  // Then check dashboard/.env file
  const envPath = path.resolve(dashboardPath, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(new RegExp(`^${name}="?([^"\\n]*)"?`, "m"));
    if (match?.[1]) return match[1];
  }

  return "";
}

interface PlatformCredentialCheck {
  platform: string;
  configured: boolean;
  details: Record<string, string | boolean>;
}

function checkPlatformCredentials(channels: string[]): PlatformCredentialCheck[] {
  const results: PlatformCredentialCheck[] = [];

  for (const channel of channels) {
    if (channel.includes("google")) {
      const customerId = readEnvVar("GOOGLE_ADS_CUSTOMER_ID");
      const clientId = readEnvVar("GOOGLE_ADS_CLIENT_ID");
      const devToken = readEnvVar("GOOGLE_ADS_DEVELOPER_TOKEN");
      results.push({
        platform: "google_ads",
        configured: !!(customerId && clientId && devToken),
        details: {
          GOOGLE_ADS_CUSTOMER_ID: customerId ? "set" : "missing",
          GOOGLE_ADS_CLIENT_ID: clientId ? "set" : "missing",
          GOOGLE_ADS_DEVELOPER_TOKEN: devToken ? "set" : "missing",
        },
      });
    } else if (channel.includes("meta") || channel.includes("facebook")) {
      const accountId = readEnvVar("META_AD_ACCOUNT_ID");
      const accessToken = readEnvVar("META_ACCESS_TOKEN");
      results.push({
        platform: "meta_ads",
        configured: !!(accountId && accessToken),
        details: {
          META_AD_ACCOUNT_ID: accountId ? "set" : "missing",
          META_ACCESS_TOKEN: accessToken ? "set" : "missing",
        },
      });
    } else if (channel.includes("linkedin")) {
      const clientId = readEnvVar("LINKEDIN_CLIENT_ID");
      const accountId = readEnvVar("LINKEDIN_ACCOUNT_ID");
      results.push({
        platform: "linkedin_ads",
        configured: !!(clientId && accountId),
        details: {
          LINKEDIN_CLIENT_ID: clientId ? "set" : "missing",
          LINKEDIN_ACCOUNT_ID: accountId ? "set" : "missing",
        },
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runAdsDeployment(prisma: any, campaignId: string): Promise<object> {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }

  console.log(`[ads-deploy] Starting deployment phase for campaign: ${campaignId}`);

  // 1. Read campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      assets: {
        select: { id: true, title: true, type: true, status: true },
      },
      adGroups: {
        select: { id: true, name: true, platform: true, status: true },
      },
    },
  });

  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  console.log(`[ads-deploy] Campaign: "${campaign.name}"`);

  // 2. Check asset approval status
  const adCreativeAssets = campaign.assets.filter(
    (a: { type: string }) => a.type === "ad_creative"
  );
  const approvedAssets = adCreativeAssets.filter(
    (a: { status: string }) => a.status === "APPROVED"
  );
  const draftAssets = adCreativeAssets.filter(
    (a: { status: string }) => a.status === "DRAFT" || a.status === "IN_REVIEW"
  );

  const allApproved = draftAssets.length === 0 || adCreativeAssets.length === 0;

  if (!allApproved) {
    console.warn(
      `[ads-deploy] ${draftAssets.length} of ${adCreativeAssets.length} ad creative assets are not yet APPROVED. Human review is required before live deployment.`
    );
  } else {
    console.log(`[ads-deploy] All ${approvedAssets.length} ad creative assets are approved.`);
  }

  // 3. Parse channels and check credentials
  const channels: string[] = campaign.channels ? JSON.parse(campaign.channels) : ["google_ads", "meta_ads"];
  console.log(`[ads-deploy] Checking credentials for: ${channels.join(", ")}`);
  const credentialChecks = checkPlatformCredentials(channels);

  const configuredPlatforms = credentialChecks.filter((c) => c.configured).map((c) => c.platform);
  const missingCredentialPlatforms = credentialChecks.filter((c) => !c.configured).map((c) => c.platform);
  const isSimulated = configuredPlatforms.length === 0;

  const deploymentMode = isSimulated ? "SIMULATED" : "LIVE";

  console.log(`[ads-deploy] Deployment mode: ${deploymentMode}`);
  if (configuredPlatforms.length > 0) {
    console.log(`[ads-deploy] Live deployment ready for: ${configuredPlatforms.join(", ")}`);
    console.log(
      "[ads-deploy] To push to live platforms, run: npx tsx scripts/google-ads-client.ts sync-push --campaignId <id>"
    );
  }
  if (missingCredentialPlatforms.length > 0) {
    console.warn(
      `[ads-deploy] Missing credentials for: ${missingCredentialPlatforms.join(", ")} — deploying in SIMULATED mode for those platforms.`
    );
  }

  // 4. Update campaign status to ACTIVE
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "ACTIVE" },
  });

  console.log("[ads-deploy] Campaign status updated to ACTIVE.");

  // 5. Find project
  let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
  if (!project) {
    project = await prisma.project.create({ data: { name: "Zavis" } });
  }

  // 6. Create monitoring schedule calendar events
  const monitoringEvents: Array<{ id: string; title: string; date: string }> = [];

  const now = new Date();
  const monitoringSchedule = [
    { offsetDays: 3, label: "Day 3 — Initial performance check" },
    { offsetDays: 7, label: "Day 7 — First week review" },
    { offsetDays: 10, label: "Day 10 — Mid-period check" },
    { offsetDays: 14, label: "Day 14 — Two-week optimization trigger" },
    { offsetDays: 21, label: "Day 21 — Three-week performance review" },
    { offsetDays: 30, label: "Day 30 — Month 1 full audit" },
  ];

  for (const slot of monitoringSchedule) {
    const eventDate = new Date(now.getTime() + slot.offsetDays * 24 * 60 * 60 * 1000);
    const event = await prisma.calendarEvent.create({
      data: {
        projectId: project.id,
        title: `Ads Monitor: ${slot.label} — ${campaign.name}`,
        description: `Automated monitoring check for paid ads campaign. Review CPA, CTR, spend, and conversion data.`,
        date: eventDate,
        eventType: "milestone",
        campaignId,
        status: "PLANNED",
        metadata: JSON.stringify({
          monitoringType: "ads_performance",
          offsetDays: slot.offsetDays,
          generatedBy: "ads-deploy",
        }),
      },
    });
    monitoringEvents.push({ id: event.id, title: event.title, date: eventDate.toISOString().slice(0, 10) });
  }

  console.log(`[ads-deploy] Created ${monitoringEvents.length} monitoring schedule events.`);

  // 7. Build deployment summary
  const platformDeploymentDetails = credentialChecks.map((check) => ({
    platform: check.platform,
    mode: check.configured ? "LIVE_READY" : "SIMULATED",
    credentials: check.details,
    action: check.configured
      ? `Run: npx tsx scripts/google-ads-client.ts sync-push --campaignId ${campaignId}`
      : "Configure credentials in dashboard/.env to enable live deployment",
  }));

  const summary = {
    campaignId,
    campaignName: campaign.name,
    phase: "deployment",
    deploymentMode,
    campaignStatus: "ACTIVE",
    assetApprovalStatus: {
      totalAdCreativeAssets: adCreativeAssets.length,
      approved: approvedAssets.length,
      pendingReview: draftAssets.length,
      allApproved,
      humanApprovalRequired: !allApproved,
      message: allApproved
        ? "All assets approved. Ready for live deployment."
        : `${draftAssets.length} assets require human approval in the dashboard before live deployment.`,
    },
    platformDeploymentDetails,
    monitoringSchedule: monitoringEvents,
    adGroupsReady: campaign.adGroups.length,
    nextPhase: "monitoring",
  };

  console.log("[ads-deploy] Deployment phase complete.");
  return summary;
}

// ---------------------------------------------------------------------------
// CLI runner
// ---------------------------------------------------------------------------

if (require.main === module) {
  const campaignId =
    process.argv.find((a, i) => process.argv[i - 1] === "--campaignId") ?? "";

  runAdsDeployment(prisma, campaignId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
