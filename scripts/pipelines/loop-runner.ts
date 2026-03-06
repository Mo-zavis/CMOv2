/**
 * loop-runner.ts — Pipeline Orchestrator
 *
 * Composable CLI that orchestrates loop execution. Each loop type has a
 * defined phase sequence. The runner:
 *   1. Reads or creates the loop state from DB
 *   2. Validates the requested phase is the correct next step
 *   3. Calls the phase-specific handler
 *   4. Logs results to LoopPhaseLog
 *   5. Advances the loop to the next phase
 *
 * Usage:
 *   npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase research
 *   npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase planning
 *   npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase creation
 *   npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase deployment
 *   npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase monitoring
 *   npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase optimization
 */

import path from "path";

const dashboardPath = path.resolve(__dirname, "../../dashboard");
const { PrismaClient } = require(path.join(dashboardPath, "node_modules/@prisma/client"));
const dbPath = path.resolve(dashboardPath, "prisma/dev.db");
const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });

// ---------------------------------------------------------------------------
// Loop type definitions (mirrors dashboard/src/lib/loop-types.ts)
// ---------------------------------------------------------------------------

const LOOP_PHASES: Record<string, string[]> = {
  ads: ["research", "planning", "creation", "deployment", "monitoring", "optimization"],
  content_seo: ["research", "planning", "creation", "publishing", "tracking", "optimization"],
  social: ["planning", "creation", "scheduling", "monitoring", "adjustment"],
  email: ["planning", "creation", "sending", "tracking", "optimization"],
  cross_channel: ["aggregation", "analysis", "reallocation"],
};

const CYCLE_BACK_PHASES: Record<string, string> = {
  ads: "monitoring",
  content_seo: "tracking",
  social: "planning",
  email: "planning",
  cross_channel: "aggregation",
};

// ---------------------------------------------------------------------------
// Phase handlers: import the individual pipeline scripts
// ---------------------------------------------------------------------------

type PhaseHandler = (prismaClient: any, campaignId: string) => Promise<object>;

async function getPhaseHandler(loopType: string, phase: string): Promise<PhaseHandler | null> {
  if (loopType === "ads") {
    switch (phase) {
      case "research": {
        const mod = await import("./ads-research");
        return mod.runAdsResearch;
      }
      case "planning": {
        const mod = await import("./ads-plan");
        return mod.runAdsPlanning;
      }
      case "creation": {
        const mod = await import("./ads-create");
        return mod.runAdsCreation;
      }
      case "deployment": {
        const mod = await import("./ads-deploy");
        return mod.runAdsDeployment;
      }
      case "monitoring": {
        const mod = await import("./ads-monitor");
        return mod.runAdsMonitoring;
      }
      case "optimization": {
        const mod = await import("./ads-optimize");
        return mod.runAdsOptimization;
      }
    }
  }

  // For other loop types, return a placeholder
  return async (_prismaClient: any, _campaignId: string) => {
    console.log(`[loop-runner] Phase handler for ${loopType}/${phase} is not yet implemented.`);
    return { phase, status: "simulated", message: `${loopType}/${phase} handler not yet implemented` };
  };
}

// ---------------------------------------------------------------------------
// Core orchestration
// ---------------------------------------------------------------------------

async function runPhase(
  loopType: string,
  campaignId: string,
  phase: string
): Promise<void> {
  // Validate loop type
  const phases = LOOP_PHASES[loopType];
  if (!phases) {
    console.error(`Unknown loop type: ${loopType}. Valid types: ${Object.keys(LOOP_PHASES).join(", ")}`);
    process.exit(1);
  }

  // Validate phase
  if (!phases.includes(phase)) {
    console.error(`Invalid phase "${phase}" for loop type "${loopType}". Valid phases: ${phases.join(", ")}`);
    process.exit(1);
  }

  console.log(`\n=== Loop Runner: ${loopType} / ${phase} ===\n`);

  // Get or create project
  let project = await prisma.project.findFirst({ where: { name: "Zavis" } });
  if (!project) {
    project = await prisma.project.create({ data: { name: "Zavis" } });
  }

  // Find or create loop execution
  let loop = await prisma.loopExecution.findFirst({
    where: { campaignId, loopType, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });

  const isFirstPhase = phase === phases[0];

  if (!loop) {
    if (!isFirstPhase) {
      console.warn(`[loop-runner] No active ${loopType} loop found for campaign ${campaignId}.`);
      console.warn(`[loop-runner] Starting a new loop from phase: ${phase}`);
    }

    loop = await prisma.loopExecution.create({
      data: {
        projectId: project.id,
        campaignId,
        loopType,
        currentPhase: phase,
        status: "ACTIVE",
        cycleNumber: 1,
      },
    });
    console.log(`[loop-runner] Created new loop execution: ${loop.id}`);
  } else {
    console.log(`[loop-runner] Existing loop: ${loop.id} (cycle ${loop.cycleNumber}, current phase: ${loop.currentPhase})`);
  }

  // Check if this phase transition makes sense
  const currentPhaseIndex = phases.indexOf(loop.currentPhase);
  const requestedPhaseIndex = phases.indexOf(phase);
  const cycleBackPhase = CYCLE_BACK_PHASES[loopType];

  // Allow: next sequential phase, cycling back from last to cycle-back phase, or re-running current
  const isSequentialNext = requestedPhaseIndex === currentPhaseIndex + 1;
  const isCycleBack = currentPhaseIndex === phases.length - 1 && phase === cycleBackPhase;
  const isSamePhase = phase === loop.currentPhase;
  const isFirstRun = isFirstPhase && currentPhaseIndex === 0;

  if (!isSequentialNext && !isCycleBack && !isSamePhase && !isFirstRun) {
    console.warn(`[loop-runner] Warning: jumping from "${loop.currentPhase}" to "${phase}" is out of sequence.`);
    console.warn(`[loop-runner] Expected next phase: ${phases[currentPhaseIndex + 1] ?? cycleBackPhase}`);
    console.warn(`[loop-runner] Proceeding anyway...\n`);
  }

  // Increment cycle number if cycling back
  let cycleNumber = loop.cycleNumber;
  if (isCycleBack) {
    cycleNumber = loop.cycleNumber + 1;
    console.log(`[loop-runner] Cycling back to ${phase}. Incrementing cycle to ${cycleNumber}.`);
  }

  // Create phase log entry (IN_PROGRESS)
  const phaseLog = await prisma.loopPhaseLog.create({
    data: {
      loopExecutionId: loop.id,
      phase,
      cycleNumber,
      status: "IN_PROGRESS",
    },
  });

  // Update loop state
  await prisma.loopExecution.update({
    where: { id: loop.id },
    data: {
      currentPhase: phase,
      cycleNumber,
    },
  });

  const startTime = Date.now();

  // Run the phase handler
  const handler = await getPhaseHandler(loopType, phase);
  if (!handler) {
    console.error(`[loop-runner] No handler found for ${loopType}/${phase}`);
    await prisma.loopPhaseLog.update({
      where: { id: phaseLog.id },
      data: { status: "FAILED", output: JSON.stringify({ error: "No handler found" }) },
    });
    process.exit(1);
  }

  let result: object;
  try {
    result = await handler(prisma, campaignId);
  } catch (error: any) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    await prisma.loopPhaseLog.update({
      where: { id: phaseLog.id },
      data: {
        status: "FAILED",
        output: JSON.stringify({ error: error.message }),
        duration,
      },
    });
    console.error(`[loop-runner] Phase ${phase} FAILED after ${duration}s:`, error.message);
    throw error;
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Update phase log as completed
  await prisma.loopPhaseLog.update({
    where: { id: phaseLog.id },
    data: {
      status: "COMPLETED",
      output: JSON.stringify(result),
      duration,
    },
  });

  // Update loop summary
  await prisma.loopExecution.update({
    where: { id: loop.id },
    data: {
      summary: JSON.stringify({
        lastPhase: phase,
        lastCycle: cycleNumber,
        lastDuration: duration,
        lastCompletedAt: new Date().toISOString(),
      }),
    },
  });

  // Determine next phase
  const nextPhaseIndex = requestedPhaseIndex + 1;
  let nextPhase: string;
  if (nextPhaseIndex >= phases.length) {
    nextPhase = cycleBackPhase;
  } else {
    nextPhase = phases[nextPhaseIndex];
  }

  console.log(`\n=== Phase "${phase}" completed in ${duration}s ===`);
  console.log(`    Loop: ${loop.id}`);
  console.log(`    Cycle: ${cycleNumber}`);
  console.log(`    Next phase: ${nextPhase}`);
  console.log(`\n    To continue:`);
  console.log(`    npx tsx scripts/pipelines/loop-runner.ts --loopType ${loopType} --campaignId ${campaignId} --phase ${nextPhase}\n`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (require.main === module) {
  const loopType = process.argv.find((a, i) => process.argv[i - 1] === "--loopType") ?? "";
  const campaignId = process.argv.find((a, i) => process.argv[i - 1] === "--campaignId") ?? "";
  const phase = process.argv.find((a, i) => process.argv[i - 1] === "--phase") ?? "";

  if (!loopType || !campaignId || !phase) {
    console.error("Usage: npx tsx scripts/pipelines/loop-runner.ts --loopType <type> --campaignId <id> --phase <phase>");
    console.error("");
    console.error("Loop types: ads, content_seo, social, email, cross_channel");
    console.error("");
    console.error("Ads phases: research, planning, creation, deployment, monitoring, optimization");
    process.exit(1);
  }

  runPhase(loopType, campaignId, phase)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
