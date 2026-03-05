import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const AnimatedCounter: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  fontSize?: number;
  color?: string;
  delay?: number;
}> = ({
  value,
  suffix = "%",
  prefix = "",
  fontSize = 120,
  color = "#4ADE80",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 80, mass: 1 },
  });

  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize,
        fontWeight: 800,
        color,
        transform: `scale(${scale})`,
        letterSpacing: "-0.04em",
        textShadow: `0 0 40px ${color}40`,
      }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </div>
  );
};
