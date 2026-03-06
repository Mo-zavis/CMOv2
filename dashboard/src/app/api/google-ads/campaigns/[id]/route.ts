import { NextRequest, NextResponse } from "next/server";
import {
  listAdGroups,
  getCampaignMetrics,
  type DateRange,
} from "@/lib/google-ads";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);

    // Default to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dateRange: DateRange = {
      start: searchParams.get("startDate") || thirtyDaysAgo.toISOString().slice(0, 10),
      end: searchParams.get("endDate") || today.toISOString().slice(0, 10),
    };

    const [adGroups, metrics] = await Promise.all([
      listAdGroups(campaignId),
      getCampaignMetrics(dateRange),
    ]);

    // Filter metrics to this campaign
    const campaignMetrics = metrics.find((m) => m.campaignId === campaignId);

    return NextResponse.json({
      campaignId,
      dateRange,
      adGroups,
      metrics: campaignMetrics || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
