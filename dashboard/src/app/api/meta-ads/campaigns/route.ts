import { NextResponse } from "next/server";
import { checkConnection, listCampaigns } from "@/lib/meta-ads";

export async function GET() {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Meta Ads not connected", campaigns: [] },
        { status: 502 }
      );
    }

    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error), campaigns: [] },
      { status: 500 }
    );
  }
}
