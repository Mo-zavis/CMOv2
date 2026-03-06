import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { action?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action } = body;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: 'Invalid action. Must be "approve" or "reject".' },
      { status: 400 }
    );
  }

  const existing = await prisma.optimizationDecision.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Optimization decision not found" },
      { status: 404 }
    );
  }

  if (existing.status !== "PROPOSED") {
    return NextResponse.json(
      {
        error: `Cannot ${action} a decision with status "${existing.status}". Only PROPOSED decisions can be actioned.`,
      },
      { status: 409 }
    );
  }

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  const updated = await prisma.optimizationDecision.update({
    where: { id },
    data: { status: newStatus },
  });

  return NextResponse.json(updated);
}
