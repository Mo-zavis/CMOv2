import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      assets: {
        select: { id: true, type: true, status: true, title: true },
      },
      adGroups: {
        include: {
          creatives: true,
        },
      },
      _count: {
        select: { assets: true, adGroups: true },
      },
    },
  });

  return NextResponse.json(campaigns);
}
