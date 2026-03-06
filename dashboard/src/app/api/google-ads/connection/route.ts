import { NextResponse } from "next/server";
import { checkConnection, getAccountInfo } from "@/lib/google-ads";

export async function GET() {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json({
        connected: false,
        account: null,
        error: "Google Ads API is not reachable or credentials are invalid",
      });
    }
    const account = await getAccountInfo();
    return NextResponse.json({ connected: true, account });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        account: null,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
