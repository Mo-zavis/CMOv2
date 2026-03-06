import { NextRequest, NextResponse } from "next/server";
import {
  checkConnection,
  getAccountPerformance,
  getKeywordPerformance,
  getSearchTermReport,
  type DateRange,
} from "@/lib/google-ads";

export async function GET(request: NextRequest) {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Google Ads not connected" },
        { status: 502 }
      );
    }

    const { searchParams } = new URL(request.url);
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dateRange: DateRange = {
      start: searchParams.get("startDate") || thirtyDaysAgo.toISOString().slice(0, 10),
      end: searchParams.get("endDate") || today.toISOString().slice(0, 10),
    };

    const campaignId = searchParams.get("campaignId");

    const performance = await getAccountPerformance(dateRange);

    // Optionally include keyword and search term data for a specific campaign
    let keywords = null;
    let searchTerms = null;
    if (campaignId) {
      [keywords, searchTerms] = await Promise.all([
        getKeywordPerformance(campaignId, dateRange),
        getSearchTermReport(campaignId, dateRange),
      ]);
    }

    return NextResponse.json({
      dateRange,
      performance,
      keywords,
      searchTerms,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
