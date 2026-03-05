import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { staticFile } from "remotion";
import { KenBurns } from "../components/KenBurns";
import { FadeTransition } from "../components/FadeTransition";
import { ProgressBar } from "../components/ProgressBar";

/**
 * Scene 2: Problem — Empty clinic waiting room
 * Ken Burns zoom on clinic image, stats overlay, revenue loss counter.
 * Duration: 6 seconds (180 frames at 30fps)
 */
export const ProblemScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text entrance animations
  const title = spring({
    frame: frame - 15,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const stat1 = spring({
    frame: frame - 40,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const stat2 = spring({
    frame: frame - 60,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const stat3 = spring({
    frame: frame - 80,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <FadeTransition durationInFrames={durationInFrames} fadeIn={12} fadeOut={12}>
      <AbsoluteFill>
        {/* Background with Ken Burns */}
        <KenBurns
          src={staticFile("images/scene2_problem.jpg")}
          durationInFrames={durationInFrames}
          direction="zoom-in"
          intensity={0.12}
        />

        {/* Dark overlay gradient */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.95) 100%)",
          }}
        />

        {/* Content */}
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "60px 50px",
            gap: 24,
            paddingBottom: "15%",
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: interpolate(title, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(title, [0, 1], [-30, 0])}px)`,
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 38,
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: 20,
            }}
          >
            Every missed appointment costs you
          </div>

          {/* Stat cards */}
          {[
            { label: "Revenue Lost Per No-Show", value: "$150 – $300", entrance: stat1, color: "#F87171" },
            { label: "Staff Time Wasted Weekly", value: "12+ Hours", entrance: stat2, color: "#FBBF24" },
            { label: "Patient Satisfaction Drop", value: "–23%", entrance: stat3, color: "#FB923C" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                opacity: interpolate(stat.entrance, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(stat.entrance, [0, 1], [40, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                backgroundColor: "rgba(255,255,255,0.06)",
                padding: "18px 24px",
                borderRadius: 12,
                borderLeft: `4px solid ${stat.color}`,
                backdropFilter: "blur(4px)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 16,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 32,
                    fontWeight: 700,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </AbsoluteFill>
      </AbsoluteFill>
    </FadeTransition>
  );
};
