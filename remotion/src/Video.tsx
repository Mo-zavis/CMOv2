import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { DemoScene } from "./scenes/DemoScene";
import { CTAScene } from "./scenes/CTAScene";

/**
 * Main Video Composition — Patient Engagement: Reduce No-Shows (Instagram Reel)
 *
 * 5 scenes, 1080x1920, 30fps
 * Scene 1: Hook         — 3s  (90 frames)   [still_image]
 * Scene 2: Problem      — 6s  (180 frames)  [veo_only placeholder → Remotion]
 * Scene 3: Solution     — 8s  (240 frames)  [veo_plus_remotion → full Remotion]
 * Scene 4: Demo         — 6s  (180 frames)  [remotion_only]
 * Scene 5: CTA          — 3s  (90 frames)   [still_image]
 *
 * Total: 26s (780 frames)
 * Overlap: 12 frames per transition (crossfade)
 */

const OVERLAP = 12; // frames of crossfade between scenes

interface SceneConfig {
  id: string;
  duration: number; // in frames
  component: React.FC<{ durationInFrames: number }>;
}

const scenes: SceneConfig[] = [
  { id: "hook", duration: 90, component: HookScene },
  { id: "problem", duration: 180, component: ProblemScene },
  { id: "solution", duration: 240, component: SolutionScene },
  { id: "demo", duration: 180, component: DemoScene },
  { id: "cta", duration: 90, component: CTAScene },
];

export const MainVideo: React.FC = () => {
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {scenes.map((scene, index) => {
        const from = currentFrame;
        // Advance by scene duration minus overlap (except last scene)
        currentFrame += scene.duration - (index < scenes.length - 1 ? OVERLAP : 0);

        const SceneComponent = scene.component;

        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.duration}
            name={`Scene ${index + 1}: ${scene.id}`}
          >
            <SceneComponent durationInFrames={scene.duration} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
