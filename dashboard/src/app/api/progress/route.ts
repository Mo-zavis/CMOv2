import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionType = searchParams.get("sessionType");
    const days = parseInt(searchParams.get("days") || "7", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const where: Record<string, unknown> = {
      sessionDate: { gte: cutoff },
    };
    if (sessionType) where.sessionType = sessionType;

    const logs = await prisma.progressLog.findMany({
      where,
      orderBy: { sessionDate: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch progress logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionType,
      summary,
      decisions,
      assetsCreated,
      loopsAdvanced,
      blockers,
      nextSteps,
      metadata,
    } = body;

    const project = await prisma.project.findFirst({
      where: { name: "Zavis" },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Zavis project not found" },
        { status: 404 }
      );
    }

    const log = await prisma.progressLog.create({
      data: {
        projectId: project.id,
        sessionType,
        summary,
        decisions: decisions ? JSON.stringify(decisions) : null,
        assetsCreated: assetsCreated ? JSON.stringify(assetsCreated) : null,
        loopsAdvanced: loopsAdvanced ? JSON.stringify(loopsAdvanced) : null,
        blockers: blockers ? JSON.stringify(blockers) : null,
        nextSteps: nextSteps ? JSON.stringify(nextSteps) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create progress log:", error);
    return NextResponse.json(
      { error: "Failed to create progress log" },
      { status: 500 }
    );
  }
}
