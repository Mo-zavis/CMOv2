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

function getTypeBorderColor(type: string): string {
  switch (type) {
    case "image":
      return "border-t-[#006828]";
    case "copy":
      return "border-t-blue-500";
    case "video":
      return "border-t-purple-500";
    case "ad_creative":
      return "border-t-orange-500";
    case "social_post":
      return "border-t-pink-500";
    case "email":
      return "border-t-yellow-500";
    default:
      return "border-t-gray-300";
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
      <Card
        className={`p-0 overflow-hidden hover:shadow-lg hover:border-[#006828]/15 transition-all duration-200 cursor-pointer group border-t-[3px] ${getTypeBorderColor(type)}`}
      >
        {/* Thumbnail area */}
        <div className="h-44 bg-muted flex items-center justify-center overflow-hidden">
          {type === "image" && latestFilePath ? (
            <img
              src={`/api/files/${latestFilePath}`}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : type === "copy" && latestContent ? (
            <div className="p-4 text-xs text-muted-foreground line-clamp-6 leading-relaxed">
              {latestContent.slice(0, 300)}
            </div>
          ) : (
            <div className="text-muted-foreground text-xs uppercase tracking-wide">
              {type.replace(/_/g, " ")}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold line-clamp-1 text-[#1c1c1c]">
              {title}
            </h3>
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
          <div className="flex items-center text-xs text-muted-foreground">
            <span>v{currentVersion}</span>
            {platform && (
              <>
                <span className="mx-1.5 text-[#ecebe8]">&middot;</span>
                <span className="capitalize">{platform}</span>
              </>
            )}
            <span className="mx-1.5 text-[#ecebe8]">&middot;</span>
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
