"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SceneStatusBadge, CompositionBadge } from "./SceneStatusBadge";

export interface VideoSceneData {
  id: string;
  sceneNumber: number;
  title: string | null;
  description: string;
  compositionType: string;
  startFramePath: string | null;
  endFramePath: string | null;
  clipPath: string | null;
  startTime: number;
  duration: number;
  voiceoverText: string | null;
  voiceoverPath: string | null;
  textOverlay: string | null;
  remotionConfig: string | null;
  status: string;
  metadata: string | null;
}

interface StoryboardTableProps {
  scenes: VideoSceneData[];
}

export function StoryboardTable({ scenes }: StoryboardTableProps) {
  const [expandedScene, setExpandedScene] = useState<number | null>(null);

  if (scenes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No scenes defined yet. The video producer skill will create the storyboard.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Storyboard ({scenes.length} scenes)
      </h3>

      <Card className="overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[50px_100px_1fr_110px_80px_60px_100px] gap-2 px-3 py-2 bg-muted/50 border-b text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>#</span>
          <span>Frame</span>
          <span>Scene</span>
          <span>Type</span>
          <span>Voice</span>
          <span>Dur.</span>
          <span>Status</span>
        </div>

        {/* Rows */}
        {scenes.map((scene, idx) => {
          const isExpanded = expandedScene === scene.sceneNumber;
          const nextScene = scenes[idx + 1];

          return (
            <div key={scene.id}>
              {/* Main row */}
              <div
                className={`grid grid-cols-[50px_100px_1fr_110px_80px_60px_100px] gap-2 px-3 py-2.5 items-center border-b cursor-pointer hover:bg-muted/30 transition-colors ${
                  isExpanded ? "bg-muted/20" : ""
                }`}
                onClick={() =>
                  setExpandedScene(isExpanded ? null : scene.sceneNumber)
                }
              >
                {/* Scene number */}
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  {scene.sceneNumber}
                </span>

                {/* Start frame thumbnail */}
                <div className="w-[88px] h-[50px] rounded overflow-hidden bg-muted flex-shrink-0">
                  {scene.startFramePath ? (
                    <img
                      src={`/api/files/${scene.startFramePath}`}
                      alt={`Scene ${scene.sceneNumber} start`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground">
                        Pending
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="min-w-0">
                  {scene.title && (
                    <span className="text-[10px] font-semibold text-foreground block">
                      {scene.title}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {scene.description}
                  </span>
                </div>

                {/* Composition type */}
                <CompositionBadge type={scene.compositionType} />

                {/* Voiceover indicator */}
                <span className="text-[10px] text-muted-foreground truncate">
                  {scene.voiceoverText
                    ? scene.voiceoverPath
                      ? "Ready"
                      : "Scripted"
                    : "None"}
                </span>

                {/* Duration */}
                <span className="text-xs font-mono text-muted-foreground">
                  {scene.duration}s
                </span>

                {/* Status */}
                <SceneStatusBadge status={scene.status} />
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 py-3 border-b bg-muted/10 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Start frame */}
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                        Start Frame
                      </span>
                      {scene.startFramePath ? (
                        <img
                          src={`/api/files/${scene.startFramePath}`}
                          alt="Start frame"
                          className="rounded border max-h-[200px] object-contain bg-black"
                        />
                      ) : (
                        <div className="h-[120px] border-2 border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">
                          Not generated yet
                        </div>
                      )}
                    </div>

                    {/* End frame */}
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                        End Frame
                        {nextScene && (
                          <span className="text-muted-foreground/60">
                            {" "}
                            → Scene {nextScene.sceneNumber} start
                          </span>
                        )}
                      </span>
                      {scene.endFramePath ? (
                        <img
                          src={`/api/files/${scene.endFramePath}`}
                          alt="End frame"
                          className="rounded border max-h-[200px] object-contain bg-black"
                        />
                      ) : (
                        <div className="h-[120px] border-2 border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">
                          Not extracted yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clip player */}
                  {scene.clipPath && (
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                        Video Clip
                      </span>
                      <video
                        src={`/api/files/${scene.clipPath}`}
                        controls
                        className="rounded border max-h-[200px] bg-black"
                        preload="metadata"
                      />
                    </div>
                  )}

                  {/* Voiceover */}
                  {scene.voiceoverText && (
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                        Voiceover Script
                      </span>
                      <p className="text-xs text-foreground bg-muted/50 rounded p-2 italic">
                        &ldquo;{scene.voiceoverText}&rdquo;
                      </p>
                      {scene.voiceoverPath && (
                        <audio
                          src={`/api/files/${scene.voiceoverPath}`}
                          controls
                          className="mt-1 h-8 w-full"
                          preload="metadata"
                        />
                      )}
                    </div>
                  )}

                  {/* Text overlay */}
                  {scene.textOverlay && (
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                        Text Overlay
                      </span>
                      <p className="text-xs font-mono bg-muted/50 rounded p-2">
                        {scene.textOverlay}
                      </p>
                    </div>
                  )}

                  {/* Remotion config */}
                  {scene.remotionConfig && (
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                        Remotion Config
                      </span>
                      <pre className="text-[10px] font-mono bg-muted/50 rounded p-2 overflow-auto max-h-[100px]">
                        {JSON.stringify(JSON.parse(scene.remotionConfig), null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Timing */}
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>
                      Start: <span className="font-mono">{scene.startTime}s</span>
                    </span>
                    <span>
                      Duration: <span className="font-mono">{scene.duration}s</span>
                    </span>
                    <span>
                      End: <span className="font-mono">{scene.startTime + scene.duration}s</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
