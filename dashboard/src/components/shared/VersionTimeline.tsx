"use client";

import { StatusBadge } from "./StatusBadge";
import { Card } from "@/components/ui/card";

interface TimelineVersion {
  id: string;
  version: number;
  filePath?: string | null;
  content?: string | null;
  changelog?: string | null;
  createdAt: string;
  feedbacks: {
    id: string;
    author: string;
    type: string;
    comment: string;
    createdAt: string;
  }[];
}

interface VersionTimelineProps {
  versions: TimelineVersion[];
  assetType: string;
  currentVersion: number;
  onVersionSelect?: (version: number) => void;
}

export function VersionTimeline({
  versions,
  assetType,
  currentVersion,
  onVersionSelect,
}: VersionTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {versions.map((v, idx) => {
          const isCurrent = v.version === currentVersion;
          const isLatest = idx === versions.length - 1;

          return (
            <div key={v.id} className="relative pl-10">
              {/* Timeline dot */}
              <div
                className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${
                  isCurrent
                    ? "bg-[#006828] border-[#006828]"
                    : "bg-white border-muted-foreground/40"
                }`}
              />

              <Card
                className={`p-4 cursor-pointer transition-shadow ${
                  isCurrent ? "ring-2 ring-[#006828]/20 shadow-sm" : "hover:shadow-sm"
                }`}
                onClick={() => onVersionSelect?.(v.version)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      v{v.version}
                    </span>
                    {isLatest && (
                      <span className="text-xs bg-[#006828]/10 text-[#006828] px-1.5 py-0.5 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Preview thumbnail for images */}
                {assetType === "image" && v.filePath && (
                  <div className="mb-2 rounded overflow-hidden bg-muted h-32 flex items-center justify-center">
                    <img
                      src={`/api/files/${v.filePath}`}
                      alt={`Version ${v.version}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                {/* Content preview for copy */}
                {assetType === "copy" && v.content && (
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                    {v.content.slice(0, 200)}...
                  </p>
                )}

                {/* Changelog */}
                {v.changelog && (
                  <p className="text-xs text-muted-foreground italic mb-2">
                    Changed: {v.changelog}
                  </p>
                )}

                {/* Feedback on this version */}
                {v.feedbacks.length > 0 && (
                  <div className="mt-2 space-y-1.5 border-t pt-2">
                    {v.feedbacks.map((fb) => (
                      <div key={fb.id} className="flex items-start gap-2">
                        <div
                          className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            fb.type === "revision"
                              ? "bg-amber-500"
                              : fb.type === "approval"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-foreground">
                            {fb.comment}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {fb.author} &middot;{" "}
                            {new Date(fb.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
