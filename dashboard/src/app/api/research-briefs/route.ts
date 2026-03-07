import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status");
    const briefType = searchParams.get("briefType");
    const loopId = searchParams.get("loopId");

    const where: Record<string, unknown> = {};
    if (campaignId) where.campaignId = campaignId;
    if (status) where.status = status;
    if (briefType) where.briefType = briefType;
    if (loopId) where.loopExecutionId = loopId;

    const briefs = await prisma.researchBrief.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(briefs);
  } catch (error) {
    console.error("Failed to fetch research briefs:", error);
    return NextResponse.json(
      { error: "Failed to fetch research briefs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { briefType, question, campaignId, loopExecutionId, context } = body;

    const project = await prisma.project.findFirst({
      where: { name: "Zavis" },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Zavis project not found" },
        { status: 404 }
      );
    }

    const brief = await prisma.researchBrief.create({
      data: {
        projectId: project.id,
        briefType,
        question,
        campaignId: campaignId || null,
        loopExecutionId: loopExecutionId || null,
        context: context ? JSON.stringify(context) : null,
        status: "PENDING",
      },
    });

    return NextResponse.json(brief, { status: 201 });
  } catch (error) {
    console.error("Failed to create research brief:", error);
    return NextResponse.json(
      { error: "Failed to create research brief" },
      { status: 500 }
    );
  }
}
