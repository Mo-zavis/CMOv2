import { NextResponse } from "next/server";
import { getIntegrations, checkConnection } from "@/lib/postiz";

export async function GET() {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json({
        connected: false,
        integrations: [],
        error: "Postiz is not reachable or API key is invalid",
      });
    }

    const integrations = await getIntegrations();
    return NextResponse.json({ connected: true, integrations });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        integrations: [],
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
