"use client";

interface TimelineScene {
  sceneNumber: number;
  duration: number;
  status: string;
  compositionType: string;
  title?: string | null;
}

interface TimelineBarProps {
  scenes: TimelineScene[];
  totalDuration: number;
}

const COMP_COLORS: Record<string, string> = {
  veo_only: "bg-blue-400",
  veo_plus_remotion: "bg-purple-400",
  remotion_only: "bg-orange-400",
  still_image: "bg-gray-400",
};

export function TimelineBar({ scenes, totalDuration }: TimelineBarProps) {
  if (scenes.length === 0 || totalDuration === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Timeline
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {totalDuration}s total
        </span>
      </div>
      <div className="flex h-8 rounded overflow-hidden border">
        {scenes.map((scene) => {
          const widthPercent = (scene.duration / totalDuration) * 100;
          const isComplete = scene.status === "COMPLETE";
          const isPending = scene.status === "PENDING";
          const bgColor = COMP_COLORS[scene.compositionType] ?? "bg-gray-400";

          return (
            <div
              key={scene.sceneNumber}
              className={`${bgColor} relative flex items-center justify-center border-r border-white/30 last:border-r-0 transition-opacity ${
                isPending ? "opacity-30" : isComplete ? "opacity-100" : "opacity-60"
              }`}
              style={{ width: `${widthPercent}%` }}
              title={`Scene ${scene.sceneNumber}: ${scene.title ?? scene.compositionType} (${scene.duration}s) — ${scene.status}`}
            >
              <span className="text-[9px] font-mono text-white font-bold drop-shadow-sm">
                S{scene.sceneNumber}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-400" /> Veo
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-purple-400" /> Veo+Remotion
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-orange-400" /> Remotion
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-gray-400" /> Still
        </span>
      </div>
    </div>
  );
}
