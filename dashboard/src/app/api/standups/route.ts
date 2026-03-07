import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const sessions = await prisma.standupSession.findMany({
      where,
      orderBy: { sessionDate: "desc" },
      take: limit,
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Failed to fetch standup sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch standup sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const project = await prisma.project.findFirst({
      where: { name: "Zavis" },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Zavis project not found" },
        { status: 404 }
      );
    }

    const session = await prisma.standupSession.create({
      data: {
        projectId: project.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Failed to create standup session:", error);
    return NextResponse.json(
      { error: "Failed to create standup session" },
      { status: 500 }
    );
  }
}
