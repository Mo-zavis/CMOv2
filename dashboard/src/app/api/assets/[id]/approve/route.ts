import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateTransition, type AssetStatus } from "@/lib/status-machine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { newStatus, reason } = body as { newStatus: AssetStatus; reason?: string };

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const validation = validateTransition(asset.status as AssetStatus, newStatus);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Perform transition
  const [updatedAsset, action] = await prisma.$transaction([
    prisma.asset.update({
      where: { id },
      data: { status: newStatus },
    }),
    prisma.approvalAction.create({
      data: {
        assetId: id,
        fromStatus: asset.status,
        toStatus: newStatus,
        actor: "human",
        reason: reason ?? null,
      },
    }),
  ]);

  return NextResponse.json({ asset: updatedAsset, action });
}
