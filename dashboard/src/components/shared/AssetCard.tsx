"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";

interface AssetCardProps {
  id: string;
  type: string;
  title: string;
  status: string;
  platform?: string | null;
  currentVersion: number;
  latestFilePath?: string | null;
  latestContent?: string | null;
  latestMetadata?: string | null;
  createdAt: string;
  updatedAt: string;
}

function getModelName(metadata: string | null | undefined): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata);
    return parsed.model || parsed.model_name || parsed.generationModel || null;
  } catch {
    return null;
  }
}

const TYPE_ROUTES: Record<string, string> = {
  image: "/images",
  copy: "/content",
  video: "/videos",
  ad_creative: "/ads",
  social_post: "/social",
  email: "/emails",
};

export function AssetCard({
  id,
  type,
  title,
  status,
  platform,
  currentVersion,
  latestFilePath,
  latestContent,
  latestMetadata,
  updatedAt,
}: AssetCardProps) {
  const route = TYPE_ROUTES[type] ?? "/library";
  const modelName = getModelName(latestMetadata);

  return (
    <Link href={`${route}/${id}`}>
      <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
        {/* Thumbnail area */}
        <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
          {type === "image" && latestFilePath ? (
            <img
              src={`/api/files/${latestFilePath}`}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : type === "copy" && latestContent ? (
            <div className="p-3 text-xs text-muted-foreground line-clamp-6 leading-relaxed">
              {latestContent.slice(0, 300)}
            </div>
          ) : (
            <div className="text-muted-foreground text-xs uppercase tracking-wide">
              {type}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
            <StatusBadge status={status} />
          </div>
          {modelName && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4c0 2 2 3 2 6H8a2 2 0 0 1-2-2 4 4 0 0 0-4 4 8 8 0 0 0 16 0 4 4 0 0 0-4-4 2 2 0 0 1-2 2h-2c0-3 2-4 2-6a4 4 0 0 0-4-4Z" />
              </svg>
              <span className="truncate">{modelName}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>v{currentVersion}</span>
            {platform && <span className="capitalize">{platform}</span>}
            <span>
              {new Date(updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
