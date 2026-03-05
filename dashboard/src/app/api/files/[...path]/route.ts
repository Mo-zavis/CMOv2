import { NextResponse } from "next/server";
import { resolveAssetPath, assetFileExists, getAssetMimeType } from "@/lib/file-store";
import fs from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const relativePath = pathSegments.join("/");
  const absolutePath = resolveAssetPath(relativePath);

  if (!assetFileExists(relativePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const mimeType = getAssetMimeType(absolutePath);
  const stat = fs.statSync(absolutePath);
  const fileSize = stat.size;

  // Support Range requests for video seeking
  const range = request.headers.get("range");
  if (range && mimeType.startsWith("video/")) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const stream = fs.createReadStream(absolutePath, { start, end });
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => {
          controller.enqueue(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        });
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(readable, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": mimeType,
      },
    });
  }

  // Non-range: read full file (fine for images and small files)
  const fileBuffer = fs.readFileSync(absolutePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
