import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.standupSession.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Standup session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to fetch standup session:", error);
    return NextResponse.json(
      { error: "Failed to fetch standup session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, summary } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (summary !== undefined) data.summary = summary;

    const session = await prisma.standupSession.update({
      where: { id },
      data,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to update standup session:", error);
    return NextResponse.json(
      { error: "Failed to update standup session" },
      { status: 500 }
    );
  }
}
