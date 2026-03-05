import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { version: "asc" },
        include: {
          feedbacks: { orderBy: { createdAt: "asc" } },
        },
      },
      feedbacks: { orderBy: { createdAt: "asc" } },
      brandChecks: { orderBy: { createdAt: "desc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      campaign: true,
      scenes: { orderBy: { sceneNumber: "asc" } },
    },
  });

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.json(asset);
}
