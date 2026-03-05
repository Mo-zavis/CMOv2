import path from "path";
import fs from "fs";

const ASSETS_ROOT = path.resolve(process.cwd(), "..", "assets");

export function getAssetDir(type: string, assetId: string): string {
  return path.join(ASSETS_ROOT, type, assetId);
}

export function getVersionFilePath(
  type: string,
  assetId: string,
  version: number,
  ext: string = "png"
): string {
  return path.join(getAssetDir(type, assetId), `v${version}.${ext}`);
}

export function getRelativePath(absolutePath: string): string {
  return path.relative(ASSETS_ROOT, absolutePath);
}

export function resolveAssetPath(relativePath: string): string {
  return path.join(ASSETS_ROOT, relativePath);
}

export function listVersionFiles(type: string, assetId: string): string[] {
  const dir = getAssetDir(type, assetId);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^v\d+\./.test(f))
    .sort((a, b) => {
      const vA = parseInt(a.match(/^v(\d+)/)?.[1] ?? "0");
      const vB = parseInt(b.match(/^v(\d+)/)?.[1] ?? "0");
      return vA - vB;
    });
}

export function assetFileExists(relativePath: string): boolean {
  return fs.existsSync(resolveAssetPath(relativePath));
}

export function getAssetMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".md": "text/markdown",
    ".html": "text/html",
    ".json": "application/json",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".pdf": "application/pdf",
  };
  return mimeMap[ext] ?? "application/octet-stream";
}
