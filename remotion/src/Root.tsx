import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./Video";

/**
 * Remotion Root — Register all compositions here.
 *
 * MainVideo: Patient Engagement — Reduce No-Shows (Instagram Reel)
 * 1080x1920 (9:16), 30fps, ~26 seconds
 */

const FPS = 30;
const OVERLAP = 12;

// Scene durations in frames
const SCENE_DURATIONS = [90, 180, 240, 180, 90]; // 3s, 6s, 8s, 6s, 3s

// Total frames = sum of durations - (overlaps between scenes)
const TOTAL_FRAMES =
  SCENE_DURATIONS.reduce((a, b) => a + b, 0) -
  OVERLAP * (SCENE_DURATIONS.length - 1);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
