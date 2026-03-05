import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { staticFile } from "remotion";

type KenBurnsDirection = "zoom-in" | "zoom-out" | "pan-left" | "pan-right";

export const KenBurns: React.FC<{
  src: string;
  durationInFrames: number;
  direction?: KenBurnsDirection;
  intensity?: number;
}> = ({ src, durationInFrames, direction = "zoom-in", intensity = 0.15 }) => {
  const frame = useCurrentFrame();
  const progress = frame / durationInFrames;

  let scale: number;
  let translateX = 0;
  let translateY = 0;

  switch (direction) {
    case "zoom-in":
      scale = interpolate(progress, [0, 1], [1, 1 + intensity]);
      break;
    case "zoom-out":
      scale = interpolate(progress, [0, 1], [1 + intensity, 1]);
      break;
    case "pan-left":
      scale = 1 + intensity;
      translateX = interpolate(progress, [0, 1], [0, -intensity * 100]);
      break;
    case "pan-right":
      scale = 1 + intensity;
      translateX = interpolate(progress, [0, 1], [-intensity * 100, 0]);
      break;
    default:
      scale = 1;
  }

  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
        }}
      />
    </AbsoluteFill>
  );
};
