import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const feedbacks = await prisma.feedback.findMany({
    where: { assetId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(feedbacks);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { type, comment, versionId } = body;

  if (!type || !comment) {
    return NextResponse.json(
      { error: "type and comment are required" },
      { status: 400 }
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      assetId: id,
      versionId: versionId ?? null,
      author: "human",
      type,
      comment,
    },
  });

  // If revision requested, update asset status
  if (type === "revision") {
    await prisma.asset.update({
      where: { id },
      data: { status: "REVISION_REQUESTED" },
    });

    await prisma.approvalAction.create({
      data: {
        assetId: id,
        fromStatus: "IN_REVIEW",
        toStatus: "REVISION_REQUESTED",
        actor: "human",
        reason: comment,
      },
    });
  }

  return NextResponse.json(feedback, { status: 201 });
}
