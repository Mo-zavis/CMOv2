import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const ProgressBar: React.FC<{
  progress: number;
  color?: string;
  height?: number;
  delay?: number;
  label?: string;
}> = ({
  progress,
  color = "#4ADE80",
  height = 8,
  delay = 0,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const width = spring({
    frame: frame - delay,
    fps,
    config: { damping: 25, stiffness: 60, mass: 1.2 },
  });

  const barWidth = interpolate(width, [0, 1], [0, progress]);

  return (
    <div style={{ width: "100%", padding: "0 60px" }}>
      {label && (
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 8,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: height / 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: height / 2,
            boxShadow: `0 0 20px ${color}60`,
          }}
        />
      </div>
    </div>
  );
};
