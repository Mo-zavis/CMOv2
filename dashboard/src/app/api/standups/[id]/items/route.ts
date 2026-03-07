import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, content, priority, context } = body;

    const item = await prisma.standupItem.create({
      data: {
        standupId: id,
        category,
        content,
        priority: priority || "NORMAL",
        context: context ? JSON.stringify(context) : null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create standup item:", error);
    return NextResponse.json(
      { error: "Failed to create standup item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const body = await request.json();
    const { itemId, response } = body;

    const item = await prisma.standupItem.update({
      where: { id: itemId },
      data: {
        response,
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update standup item:", error);
    return NextResponse.json(
      { error: "Failed to update standup item" },
      { status: 500 }
    );
  }
}
