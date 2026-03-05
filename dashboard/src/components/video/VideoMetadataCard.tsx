"use client";

import { Card } from "@/components/ui/card";

interface VideoMeta {
  format?: string;
  dimensions?: string;
  fps?: number;
  targetDuration?: number;
  platform?: string;
  pillar?: string;
}

interface VideoMetadataCardProps {
  metadata: VideoMeta;
  sceneStats: { total: number; complete: number; failed: number };
}

export function VideoMetadataCard({ metadata, sceneStats }: VideoMetadataCardProps) {
  const rows: { label: string; value: string }[] = [];

  if (metadata.dimensions) rows.push({ label: "Dimensions", value: metadata.dimensions });
  if (metadata.format) rows.push({ label: "Format", value: metadata.format });
  if (metadata.fps) rows.push({ label: "FPS", value: String(metadata.fps) });
  if (metadata.targetDuration) rows.push({ label: "Target Duration", value: `${metadata.targetDuration}s` });
  if (metadata.platform) rows.push({ label: "Platform", value: metadata.platform.replace(/_/g, " ") });
  if (metadata.pillar) rows.push({ label: "Pillar", value: metadata.pillar.replace(/_/g, " ") });

  return (
    <Card className="p-4 space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Video Info
      </h4>

      {/* Scene progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span>Scenes</span>
          <span className="font-mono">
            {sceneStats.complete}/{sceneStats.total} complete
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{
              width: sceneStats.total > 0
                ? `${(sceneStats.complete / sceneStats.total) * 100}%`
                : "0%",
            }}
          />
        </div>
        {sceneStats.failed > 0 && (
          <span className="text-[10px] text-red-600">
            {sceneStats.failed} failed
          </span>
        )}
      </div>

      {/* Metadata rows */}
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-mono capitalize">{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
