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

    // === AGENTIC LOOP COMMANDS ===

    case "create-loop": {
      const loopType = getFlag("loopType");
      const campaignId = getFlag("campaignId");
      const config = getFlag("config");

      if (!loopType) {
        console.error("Required: --loopType (ads | content_seo | social | email | cross_channel)");
        process.exit(1);
      }

      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const firstPhases: Record<string, string> = {
        ads: "research",
        content_seo: "research",
        social: "planning",
        email: "planning",
        cross_channel: "aggregation",
      };

      const loop = await prisma.loopExecution.create({
        data: {
          projectId: project.id,
          campaignId: campaignId ?? null,
          loopType,
          currentPhase: firstPhases[loopType] || "research",
          status: "ACTIVE",
          cycleNumber: 1,
          config: config ?? null,
        },
      });

      // Create initial phase log
      await prisma.loopPhaseLog.create({
        data: {
          loopExecutionId: loop.id,
          phase: loop.currentPhase,
          cycleNumber: 1,
          status: "IN_PROGRESS",
        },
      });

      console.log(JSON.stringify({ id: loop.id, loopType, phase: loop.currentPhase, message: "Loop created" }));
      break;
    }

    case "advance-loop": {
      const loopId = getFlag("loopId");
      const phase = getFlag("phase");
      const output = getFlag("output");
      const decisions = getFlag("decisions");

      if (!loopId || !phase) {
        console.error("Required: --loopId --phase");
        process.exit(1);
      }

      const loop = await prisma.loopExecution.findUnique({ where: { id: loopId } });
      if (!loop) {
        console.error("Loop not found");
        process.exit(1);
      }

      // Complete current phase log
      await prisma.loopPhaseLog.updateMany({
        where: {
          loopExecutionId: loopId,
          phase: loop.currentPhase,
          cycleNumber: loop.cycleNumber,
          status: "IN_PROGRESS",
        },
        data: {
          status: "COMPLETED",
          output: output ?? null,
          decisions: decisions ?? null,
        },
      });

      // Determine if we're cycling (optimization → monitoring means new cycle)
      const monitorPhases = ["monitoring", "tracking", "aggregation"];
      const optimizePhases = ["optimization", "adjustment", "reallocation"];
      const newCycle =
        optimizePhases.includes(loop.currentPhase) && monitorPhases.includes(phase)
          ? loop.cycleNumber + 1
          : loop.cycleNumber;

      // Update loop
      await prisma.loopExecution.update({
        where: { id: loopId },
        data: {
          currentPhase: phase,
          cycleNumber: newCycle,
        },
      });

      // Create new phase log
      await prisma.loopPhaseLog.create({
        data: {
          loopExecutionId: loopId,
          phase,
          cycleNumber: newCycle,
          status: "IN_PROGRESS",
        },
      });

      console.log(JSON.stringify({ loopId, phase, cycleNumber: newCycle, message: "Loop advanced" }));
      break;
    }

    case "record-metric": {
      const channel = getFlag("channel");
      const metricType = getFlag("metricType");
      const value = getFlag("value");
      const campaignId = getFlag("campaignId");
      const period = getFlag("period");
      const metadata = getFlag("metadata");

      if (!channel || !metricType || !value) {
        console.error("Required: --channel --metricType --value");
        process.exit(1);
      }

      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const metric = await prisma.metricSnapshot.create({
        data: {
          projectId: project.id,
          campaignId: campaignId ?? null,
          channel,
          metricType,
          value: parseFloat(value),
          metadata: metadata ?? null,
          period: period ?? "daily",
        },
      });

      console.log(JSON.stringify({ id: metric.id, message: "Metric recorded" }));
      break;
    }

    case "record-optimization": {
      const campaignId = getFlag("campaignId");
      const loopExecutionId = getFlag("loopId");
      const decisionType = getFlag("decisionType");
      const rationale = getFlag("rationale");
      const before = getFlag("before");
      const after = getFlag("after");

      if (!decisionType || !rationale || !before || !after) {
        console.error("Required: --decisionType --rationale --before --after");
        process.exit(1);
      }

      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const decision = await prisma.optimizationDecision.create({
        data: {
          projectId: project.id,
          loopExecutionId: loopExecutionId ?? null,
          campaignId: campaignId ?? null,
          decisionType,
          rationale,
          before,
          after,
          status: "PROPOSED",
        },
      });

      console.log(JSON.stringify({ id: decision.id, message: "Optimization decision recorded" }));
      break;
    }

    case "apply-optimization": {
      const optimizationId = getFlag("optimizationId");

      if (!optimizationId) {
        console.error("Required: --optimizationId");
        process.exit(1);
      }

      await prisma.optimizationDecision.update({
        where: { id: optimizationId },
        data: { status: "APPLIED" },
      });

      console.log(JSON.stringify({ optimizationId, message: "Optimization applied" }));
      break;
    }

    case "measure-optimization": {
      const optimizationId = getFlag("optimizationId");
      const impact = getFlag("impact");

      if (!optimizationId || !impact) {
        console.error("Required: --optimizationId --impact");
        process.exit(1);
      }

      await prisma.optimizationDecision.update({
        where: { id: optimizationId },
        data: { status: "MEASURED", impact },
      });

      console.log(JSON.stringify({ optimizationId, message: "Optimization impact measured" }));
      break;
    }

    case "create-research": {
      const artifactType = getFlag("artifactType");
      const title = getFlag("title");
      const data = getFlag("data");
      const campaignId = getFlag("campaignId");
      const source = getFlag("source");

      if (!artifactType || !title || !data) {
        console.error("Required: --artifactType --title --data");
        process.exit(1);
      }

      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const artifact = await prisma.researchArtifact.create({
        data: {
          projectId: project.id,
          campaignId: campaignId ?? null,
          artifactType,
          title,
          data,
          source: source ?? null,
        },
      });

      console.log(JSON.stringify({ id: artifact.id, message: "Research artifact created" }));
      break;
    }

    case "update-north-star": {
      const campaignId = getFlag("campaignId");
      const actual = getFlag("actual");

      if (!campaignId || !actual) {
        console.error("Required: --campaignId --actual");
        process.exit(1);
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { northStarActual: parseFloat(actual) },
      });

      console.log(JSON.stringify({ campaignId, northStarActual: parseFloat(actual), message: "North star updated" }));
      break;
    }

    case "loop-status": {
      const campaignId = getFlag("campaignId");
      const loopType = getFlag("loopType");

      const where: Record<string, unknown> = {};
      if (campaignId) where.campaignId = campaignId;
      if (loopType) where.loopType = loopType;

      const loops = await prisma.loopExecution.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          phases: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      console.log(JSON.stringify(loops, null, 2));
      break;
    }

    case "metrics-summary": {
      const channel = getFlag("channel");
      const campaignId = getFlag("campaignId");
      const days = getFlag("days");

      const since = new Date();
      since.setDate(since.getDate() - (days ? parseInt(days) : 30));

      const where: Record<string, unknown> = {
        recordedAt: { gte: since },
      };
      if (channel) where.channel = channel;
      if (campaignId) where.campaignId = campaignId;

      const metrics = await prisma.metricSnapshot.findMany({
        where,
        orderBy: { recordedAt: "desc" },
      });

      console.log(JSON.stringify(metrics, null, 2));
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

    // === RESEARCH BRIEF COMMANDS ===

    case "create-research-brief": {
      const briefType = getFlag("briefType");
      const question = getFlag("question");
      const campaignId = getFlag("campaignId");
      const loopExecutionId = getFlag("loopId");
      const context = getFlag("context");

      if (!briefType || !question) {
        console.error("Required: --briefType --question");
        process.exit(1);
      }

      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const brief = await prisma.researchBrief.create({
        data: {
          projectId: project.id,
          campaignId: campaignId ?? null,
          loopExecutionId: loopExecutionId ?? null,
          briefType,
          question,
          context: context ?? null,
          status: "PENDING",
        },
      });

      console.log(JSON.stringify({ id: brief.id, message: "Research brief created" }));
      break;
    }

    case "update-research-brief": {
      const briefId = getFlag("briefId");
      const status = getFlag("status");
      const findings = getFlag("findings");
      const confidence = getFlag("confidence");
      const sources = getFlag("sources");

      if (!briefId) {
        console.error("Required: --briefId");
        process.exit(1);
      }

      const updateData: Record<string, unknown> = {};
      if (status) updateData.status = status;
      if (findings) updateData.findings = findings;
      if (confidence) updateData.confidence = parseFloat(confidence);
      if (sources) updateData.sources = sources;

      await prisma.researchBrief.update({
        where: { id: briefId },
        data: updateData,
      });

      console.log(JSON.stringify({ briefId, message: "Research brief updated" }));
      break;
    }

    case "list-research-briefs": {
      const campaignId = getFlag("campaignId");
      const status = getFlag("status");
      const briefType = getFlag("briefType");

      const where: Record<string, unknown> = {};
      if (campaignId) where.campaignId = campaignId;
      if (status) where.status = status;
      if (briefType) where.briefType = briefType;

      const briefs = await prisma.researchBrief.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      console.log(JSON.stringify(briefs, null, 2));
      break;
    }

    // === STANDUP COMMANDS ===

    case "create-standup": {
      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const standup = await prisma.standupSession.create({
        data: {
          projectId: project.id,
          status: "ACTIVE",
        },
      });

      console.log(JSON.stringify({ id: standup.id, message: "Standup session created" }));
      break;
    }

    case "add-standup-item": {
      const standupId = getFlag("standupId");
      const category = getFlag("category");
      const content = getFlag("content");
      const priority = getFlag("priority");
      const context = getFlag("context");

      if (!standupId || !category || !content) {
        console.error("Required: --standupId --category --content");
        process.exit(1);
      }

      const item = await prisma.standupItem.create({
        data: {
          standupId,
          category,
          content,
          priority: priority ?? "NORMAL",
          context: context ?? null,
        },
      });

      console.log(JSON.stringify({ id: item.id, message: "Standup item added" }));
      break;
    }

    case "respond-standup-item": {
      const itemId = getFlag("itemId");
      const response = getFlag("response");

      if (!itemId || !response) {
        console.error("Required: --itemId --response");
        process.exit(1);
      }

      await prisma.standupItem.update({
        where: { id: itemId },
        data: {
          response,
          resolved: true,
          resolvedAt: new Date(),
        },
      });

      console.log(JSON.stringify({ itemId, message: "Standup item responded" }));
      break;
    }

    case "complete-standup": {
      const standupId = getFlag("standupId");
      const summary = getFlag("summary");

      if (!standupId) {
        console.error("Required: --standupId");
        process.exit(1);
      }

      await prisma.standupSession.update({
        where: { id: standupId },
        data: {
          status: "COMPLETED",
          summary: summary ?? null,
        },
      });

      console.log(JSON.stringify({ standupId, message: "Standup completed" }));
      break;
    }

    case "list-standups": {
      const status = getFlag("status");
      const limit = getFlag("limit");

      const where: Record<string, unknown> = {};
      if (status) where.status = status;

      const standups = await prisma.standupSession.findMany({
        where,
        orderBy: { sessionDate: "desc" },
        take: limit ? parseInt(limit) : 10,
        include: {
          items: { orderBy: { createdAt: "asc" } },
        },
      });

      console.log(JSON.stringify(standups, null, 2));
      break;
    }

    // === PROGRESS LOG COMMANDS ===

    case "log-progress": {
      const sessionType = getFlag("sessionType");
      const summary = getFlag("summary");
      const decisions = getFlag("decisions");
      const assetsCreated = getFlag("assetsCreated");
      const loopsAdvanced = getFlag("loopsAdvanced");
      const blockers = getFlag("blockers");
      const nextSteps = getFlag("nextSteps");
      const metadata = getFlag("metadata");

      if (!sessionType || !summary) {
        console.error("Required: --sessionType --summary");
        process.exit(1);
      }

      let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
      if (!project) {
        project = await prisma.project.create({ data: { name: "Zavis" } });
      }

      const log = await prisma.progressLog.create({
        data: {
          projectId: project.id,
          sessionType,
          summary,
          decisions: decisions ?? null,
          assetsCreated: assetsCreated ?? null,
          loopsAdvanced: loopsAdvanced ?? null,
          blockers: blockers ?? null,
          nextSteps: nextSteps ?? null,
          metadata: metadata ?? null,
        },
      });

      console.log(JSON.stringify({ id: log.id, message: "Progress logged" }));
      break;
    }

    case "list-progress": {
      const sessionType = getFlag("sessionType");
      const days = getFlag("days");
      const limit = getFlag("limit");

      const since = new Date();
      since.setDate(since.getDate() - (days ? parseInt(days) : 7));

      const where: Record<string, unknown> = {
        sessionDate: { gte: since },
      };
      if (sessionType) where.sessionType = sessionType;

      const logs = await prisma.progressLog.findMany({
        where,
        orderBy: { sessionDate: "desc" },
        take: limit ? parseInt(limit) : 20,
      });

      console.log(JSON.stringify(logs, null, 2));
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.error("Available commands: seed-project, create-asset, add-version, add-brand-check, read-feedback, mark-feedback-actioned, create-campaign, create-ad-group, create-ad-creative, create-video-scene, update-scene-status, update-scene-files, list-scenes, create-calendar-event, list-calendar-events, update-calendar-event, create-loop, advance-loop, record-metric, record-optimization, apply-optimization, measure-optimization, create-research, update-north-star, loop-status, metrics-summary, create-research-brief, update-research-brief, list-research-briefs, create-standup, add-standup-item, respond-standup-item, complete-standup, list-standups, log-progress, list-progress");
      process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
