import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [campaigns, trendSnapshots] = await Promise.all([
    prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        northStarTarget: true,
        northStarActual: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.metricSnapshot.findMany({
      where: {
        metricType: "demo_bookings",
        channel: "overall",
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: "asc" },
    }),
  ]);

  const totalTarget = campaigns.reduce(
    (sum, c) => sum + (c.northStarTarget ?? 0),
    0
  );
  const totalActual = campaigns.reduce(
    (sum, c) => sum + (c.northStarActual ?? 0),
    0
  );

  // Group trend snapshots by date (YYYY-MM-DD), summing values per day
  const trendByDate: Record<string, number> = {};
  for (const snapshot of trendSnapshots) {
    const date = snapshot.recordedAt.toISOString().slice(0, 10);
    trendByDate[date] = (trendByDate[date] ?? 0) + snapshot.value;
  }
  const trend = Object.entries(trendByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  return NextResponse.json({
    totalTarget,
    totalActual,
    campaigns: campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      target: c.northStarTarget ?? 0,
      actual: c.northStarActual ?? 0,
    })),
    trend,
  });
}
