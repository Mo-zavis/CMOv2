import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const brief = await prisma.researchBrief.findUnique({
      where: { id },
    });

    if (!brief) {
      return NextResponse.json(
        { error: "Research brief not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(brief);
  } catch (error) {
    console.error("Failed to fetch research brief:", error);
    return NextResponse.json(
      { error: "Failed to fetch research brief" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, findings, confidence, sources } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (findings !== undefined)
      data.findings = typeof findings === "string" ? findings : JSON.stringify(findings);
    if (confidence !== undefined) data.confidence = confidence;
    if (sources !== undefined)
      data.sources = typeof sources === "string" ? sources : JSON.stringify(sources);

    const brief = await prisma.researchBrief.update({
      where: { id },
      data,
    });

    return NextResponse.json(brief);
  } catch (error) {
    console.error("Failed to update research brief:", error);
    return NextResponse.json(
      { error: "Failed to update research brief" },
      { status: 500 }
    );
  }
}
