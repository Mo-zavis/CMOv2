/**
 * db-writer.ts — CLI utility for the CMO agent (runtime) to write to the shared DB.
 *
 * Usage (via tsx from project root):
 *   npx tsx scripts/db-writer.ts create-asset --type image --title "Hero Banner" --platform linkedin
 *   npx tsx scripts/db-writer.ts add-version --assetId <id> --filePath images/<id>/v2.png --changelog "Adjusted colors"
 *   npx tsx scripts/db-writer.ts add-brand-check --assetId <id> --version 1 --checkType visual_qa --score 4.2 --passed true --details '{...}'
 *   npx tsx scripts/db-writer.ts read-feedback [--assetId <id>]
 *   npx tsx scripts/db-writer.ts seed-project
 */

import path from "path";

// Dynamically require the dashboard's generated Prisma client
const dashboardPath = path.resolve(__dirname, "../dashboard");
const { PrismaClient } = require(
  path.join(dashboardPath, "node_modules/@prisma/client")
);

const dbPath = path.resolve(dashboardPath, "prisma/dev.db");
const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${dbPath}` },
  },
});

const args = process.argv.slice(2);
const command = args[0];

function getFlag(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

async function main() {
  switch (command) {
    case "seed-project": {
      const existing = await prisma.project.findFirst({
        where: { name: "Zavis" },
      });
      if (existing) {
        console.log(JSON.stringify({ id: existing.id, message: "Project already exists" }));
        return;
      }
      const project = await prisma.project.create({
        data: { name: "Zavis" },
      });
      console.log(JSON.stringify({ id: project.id, message: "Project created" }));
      break;
    }

    case "create-asset": {
      const type = getFlag("type");
      const title = getFlag("title");
      const platform = getFlag("platform");
      const subtype = getFlag("subtype");
      const description = getFlag("description");
      const filePath = getFlag("filePath");
      const content = getFlag("content");
      const metadata = getFlag("metadata");
      const campaignId = getFlag("campaignId");

      if (!type || !title) {
        console.error("Required: --type and --title");
        process.exit(1);
      }

      // Find default project
      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const asset = await prisma.asset.create({
        data: {
          projectId: project.id,
          type,
          title,
          platform: platform ?? null,
          subtype: subtype ?? null,
          description: description ?? null,
          campaignId: campaignId ?? null,
          metadata: metadata ?? null,
          status: "DRAFT",
          currentVersion: 1,
        },
      });

      // Create first version
      await prisma.assetVersion.create({
        data: {
          assetId: asset.id,
          version: 1,
          filePath: filePath ?? null,
          content: content ?? null,
          metadata: metadata ?? null,
          changelog: "Initial generation",
        },
      });

      console.log(JSON.stringify({ id: asset.id, message: "Asset created with v1" }));
      break;
    }

    case "add-version": {
      const assetId = getFlag("assetId");
      const filePath = getFlag("filePath");
      const content = getFlag("content");
      const changelog = getFlag("changelog");
      const metadata = getFlag("metadata");

      if (!assetId) {
        console.error("Required: --assetId");
        process.exit(1);
      }

      const asset = await prisma.asset.findUnique({ where: { id: assetId } });
      if (!asset) {
        console.error("Asset not found");
        process.exit(1);
      }

      const newVersion = asset.currentVersion + 1;

      await prisma.assetVersion.create({
        data: {
          assetId,
          version: newVersion,
          filePath: filePath ?? null,
          content: content ?? null,
          metadata: metadata ?? null,
          changelog: changelog ?? null,
        },
      });

      await prisma.asset.update({
        where: { id: assetId },
        data: {
          currentVersion: newVersion,
          status: "DRAFT",
        },
      });

      console.log(JSON.stringify({ assetId, version: newVersion, message: "Version added" }));
      break;
    }

    case "add-brand-check": {
      const assetId = getFlag("assetId");
      const version = getFlag("version");
      const checkType = getFlag("checkType");
      const score = getFlag("score");
      const passed = getFlag("passed");
      const details = getFlag("details");

      if (!assetId || !version || !checkType || !details) {
        console.error("Required: --assetId --version --checkType --details");
        process.exit(1);
      }

      const check = await prisma.brandCheck.create({
        data: {
          assetId,
          versionNumber: parseInt(version),
          checkType,
          score: score ? parseFloat(score) : null,
          passed: passed === "true",
          details,
        },
      });

      // Update asset status to IN_REVIEW after brand check
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: "IN_REVIEW" },
      });

      console.log(JSON.stringify({ id: check.id, message: "Brand check added, status set to IN_REVIEW" }));
      break;
    }

    case "read-feedback": {
      const assetId = getFlag("assetId");

      const where: Record<string, unknown> = { actionTaken: null };
      if (assetId) where.assetId = assetId;

      const feedbacks = await prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "asc" },
        include: { asset: { select: { title: true, type: true } } },
      });

      console.log(JSON.stringify(feedbacks, null, 2));
      break;
    }

    case "create-campaign": {
      const name = getFlag("name");
      const objective = getFlag("objective");
      const pillar = getFlag("pillar");
      const budget = getFlag("budget");
      const targeting = getFlag("targeting");
      const channels = getFlag("channels");
      const kpis = getFlag("kpis");
      const startDate = getFlag("startDate");
      const endDate = getFlag("endDate");

      if (!name) {
        console.error("Required: --name");
        process.exit(1);
      }

      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const campaign = await prisma.campaign.create({
        data: {
          projectId: project.id,
          name,
          objective: objective ?? null,
          pillar: pillar ?? null,
          budget: budget ? parseFloat(budget) : null,
          targeting: targeting ?? null,
          channels: channels ?? null,
          kpis: kpis ?? null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          status: "PLANNING",
        },
      });

      console.log(JSON.stringify({ id: campaign.id, message: "Campaign created" }));
      break;
    }

    case "create-ad-group": {
      const campaignId = getFlag("campaignId");
      const name = getFlag("name");
      const platform = getFlag("platform");
      const adType = getFlag("adType");
      const targeting = getFlag("targeting");
      const keywords = getFlag("keywords");
      const budget = getFlag("budget");
      const bidStrategy = getFlag("bidStrategy");

      if (!campaignId || !name || !platform || !adType) {
        console.error("Required: --campaignId --name --platform --adType");
        process.exit(1);
      }

      const adGroup = await prisma.adGroup.create({
        data: {
          campaignId,
          name,
          platform,
          adType,
          targeting: targeting ?? null,
          keywords: keywords ?? null,
          budget: budget ? parseFloat(budget) : null,
          bidStrategy: bidStrategy ?? null,
        },
      });

      console.log(JSON.stringify({ id: adGroup.id, message: "Ad group created" }));
      break;
    }

    case "create-ad-creative": {
      const adGroupId = getFlag("adGroupId");
      const headline = getFlag("headline");
      const description = getFlag("description");
      const cta = getFlag("cta");
      const landingUrl = getFlag("landingUrl");
      const format = getFlag("format");
      const imageAssetId = getFlag("imageAssetId");
      const copyAssetId = getFlag("copyAssetId");
      const utmParams = getFlag("utmParams");
      const metadata = getFlag("metadata");

      if (!adGroupId || !headline || !format) {
        console.error("Required: --adGroupId --headline --format");
        process.exit(1);
      }

      const creative = await prisma.adCreative.create({
        data: {
          adGroupId,
          headline,
          description: description ?? null,
          cta: cta ?? null,
          landingUrl: landingUrl ?? null,
          format,
          imageAssetId: imageAssetId ?? null,
          copyAssetId: copyAssetId ?? null,
          utmParams: utmParams ?? null,
          metadata: metadata ?? null,
        },
      });

      console.log(JSON.stringify({ id: creative.id, message: "Ad creative created" }));
      break;
    }

    case "create-video-scene": {
      const assetId = getFlag("assetId");
      const sceneNumber = getFlag("sceneNumber");
      const description = getFlag("description");
      const compositionType = getFlag("compositionType");
      const title = getFlag("title");
      const duration = getFlag("duration");
      const startTime = getFlag("startTime");
      const voiceoverText = getFlag("voiceoverText");
      const textOverlay = getFlag("textOverlay");
      const remotionConfig = getFlag("remotionConfig");

      if (!assetId || !sceneNumber || !description || !compositionType) {
        console.error("Required: --assetId --sceneNumber --description --compositionType");
        process.exit(1);
      }

      const scene = await prisma.videoScene.create({
        data: {
          assetId,
          sceneNumber: parseInt(sceneNumber),
          title: title ?? null,
          description,
          compositionType,
          duration: duration ? parseFloat(duration) : 5,
          startTime: startTime ? parseFloat(startTime) : 0,
          voiceoverText: voiceoverText ?? null,
          textOverlay: textOverlay ?? null,
          remotionConfig: remotionConfig ?? null,
          status: "PENDING",
        },
      });

      console.log(JSON.stringify({ id: scene.id, sceneNumber: scene.sceneNumber, message: "Scene created" }));
      break;
    }

    case "update-scene-status": {
      const assetId = getFlag("assetId");
      const sceneNumber = getFlag("sceneNumber");
      const status = getFlag("status");
      const metadata = getFlag("metadata");

      if (!assetId || !sceneNumber || !status) {
        console.error("Required: --assetId --sceneNumber --status");
        process.exit(1);
      }

      const updateData: Record<string, unknown> = { status };
      if (metadata) updateData.metadata = metadata;

      await prisma.videoScene.update({
        where: {
          assetId_sceneNumber: {
            assetId,
            sceneNumber: parseInt(sceneNumber),
          },
        },
        data: updateData,
      });

      console.log(JSON.stringify({ assetId, sceneNumber, status, message: "Scene status updated" }));
      break;
    }

    case "update-scene-files": {
      const assetId = getFlag("assetId");
      const sceneNumber = getFlag("sceneNumber");
      const startFramePath = getFlag("startFramePath");
      const endFramePath = getFlag("endFramePath");
      const clipPath = getFlag("clipPath");
      const voiceoverPath = getFlag("voiceoverPath");

      if (!assetId || !sceneNumber) {
        console.error("Required: --assetId --sceneNumber");
        process.exit(1);
      }

      const fileUpdate: Record<string, unknown> = {};
      if (startFramePath) fileUpdate.startFramePath = startFramePath;
      if (endFramePath) fileUpdate.endFramePath = endFramePath;
      if (clipPath) fileUpdate.clipPath = clipPath;
      if (voiceoverPath) fileUpdate.voiceoverPath = voiceoverPath;

      if (Object.keys(fileUpdate).length === 0) {
        console.error("Provide at least one: --startFramePath --endFramePath --clipPath --voiceoverPath");
        process.exit(1);
      }

      await prisma.videoScene.update({
        where: {
          assetId_sceneNumber: {
            assetId,
            sceneNumber: parseInt(sceneNumber),
          },
        },
        data: fileUpdate,
      });

      console.log(JSON.stringify({ assetId, sceneNumber, message: "Scene files updated" }));
      break;
    }

    case "list-scenes": {
      const assetId = getFlag("assetId");

      if (!assetId) {
        console.error("Required: --assetId");
        process.exit(1);
      }

      const scenes = await prisma.videoScene.findMany({
        where: { assetId },
        orderBy: { sceneNumber: "asc" },
      });

      console.log(JSON.stringify(scenes, null, 2));
      break;
    }

    case "create-calendar-event": {
      const title = getFlag("title");
      const date = getFlag("date");
      const endDate = getFlag("endDate");
      const eventType = getFlag("eventType");
      const platform = getFlag("platform");
      const description = getFlag("description");
      const assetId = getFlag("assetId");
      const campaignId = getFlag("campaignId");
      const status = getFlag("status");
      const metadata = getFlag("metadata");

      if (!title || !date || !eventType) {
        console.error("Required: --title --date --eventType");
        process.exit(1);
      }

      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const event = await prisma.calendarEvent.create({
        data: {
          projectId: project.id,
          title,
          date: new Date(date),
          endDate: endDate ? new Date(endDate) : null,
          eventType,
          platform: platform ?? null,
          description: description ?? null,
          assetId: assetId ?? null,
          campaignId: campaignId ?? null,
          status: status ?? "PLANNED",
          metadata: metadata ?? null,
        },
      });

      console.log(JSON.stringify({ id: event.id, message: "Calendar event created" }));
      break;
    }

    case "list-calendar-events": {
      const month = getFlag("month");
      const eventType = getFlag("eventType");

      const where: Record<string, unknown> = {};
      if (month) {
        const [y, m] = month.split("-").map(Number);
        where.date = {
          gte: new Date(y, m - 1, 1),
          lt: new Date(y, m, 1),
        };
      }
      if (eventType) where.eventType = eventType;

      const events = await prisma.calendarEvent.findMany({
        where,
        orderBy: { date: "asc" },
      });

      console.log(JSON.stringify(events, null, 2));
      break;
    }

    case "update-calendar-event": {
      const eventId = getFlag("eventId");
      const assetId = getFlag("assetId");
      const campaignId = getFlag("campaignId");
      const status = getFlag("status");

      if (!eventId) {
        console.error("Required: --eventId");
        process.exit(1);
      }

      const updateData: Record<string, unknown> = {};
      if (assetId) updateData.assetId = assetId;
      if (campaignId) updateData.campaignId = campaignId;
      if (status) updateData.status = status;

      await prisma.calendarEvent.update({
        where: { id: eventId },
        data: updateData,
      });

      console.log(JSON.stringify({ eventId, message: "Calendar event updated" }));
      break;
    }

    case "mark-feedback-actioned": {
      const feedbackId = getFlag("feedbackId");
      const actionTaken = getFlag("actionTaken");
      const resultVersionId = getFlag("resultVersionId");

      if (!feedbackId) {
        console.error("Required: --feedbackId");
        process.exit(1);
      }

      await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          actionTaken: actionTaken ?? "Addressed in new version",
          resultVersionId: resultVersionId ?? null,
        },
      });

      console.log(JSON.stringify({ feedbackId, message: "Feedback marked as actioned" }));
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.error("Available commands: seed-project, create-asset, add-version, add-brand-check, read-feedback, mark-feedback-actioned, create-campaign, create-ad-group, create-ad-creative, create-video-scene, update-scene-status, update-scene-files, list-scenes, create-calendar-event, list-calendar-events, update-calendar-event");
      process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
