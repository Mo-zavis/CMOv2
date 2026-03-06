import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const loop = await prisma.loopExecution.findUnique({
    where: { id },
    include: {
      phases: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!loop) {
    return NextResponse.json({ error: "Loop execution not found" }, { status: 404 });
  }

  return NextResponse.json(loop);
}
