"use client";

import { Badge } from "@/components/ui/badge";
import {
  SCENE_STATUS_LABELS,
  SCENE_STATUS_COLORS,
  type SceneStatus,
} from "@/lib/scene-status";

export function SceneStatusBadge({ status }: { status: string }) {
  const label =
    SCENE_STATUS_LABELS[status as SceneStatus] ?? status;
  const color =
    SCENE_STATUS_COLORS[status as SceneStatus] ?? "bg-gray-100 text-gray-700";

  return (
    <Badge variant="secondary" className={`${color} text-[10px]`}>
      {label}
    </Badge>
  );
}

export function CompositionBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    veo_only: "Veo",
    veo_plus_remotion: "Veo + Remotion",
    remotion_only: "Remotion",
    still_image: "Still",
  };
  const colors: Record<string, string> = {
    veo_only: "bg-blue-100 text-blue-700",
    veo_plus_remotion: "bg-purple-100 text-purple-700",
    remotion_only: "bg-orange-100 text-orange-700",
    still_image: "bg-gray-100 text-gray-600",
  };

  return (
    <Badge
      variant="secondary"
      className={`${colors[type] ?? "bg-gray-100 text-gray-600"} text-[10px]`}
    >
      {labels[type] ?? type}
    </Badge>
  );
}
