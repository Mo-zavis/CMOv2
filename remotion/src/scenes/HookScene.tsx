import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { staticFile } from "remotion";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { TextOverlay } from "../components/TextOverlay";
import { FadeTransition } from "../components/FadeTransition";

/**
 * Scene 1: Hook — "40% of appointments are no-shows"
 * Dark medical background with bold animated stat counter.
 * Duration: 3 seconds (90 frames at 30fps)
 */
export const HookScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulsing glow on the background
  const glowIntensity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.5]
  );

  // Staggered entrance
  const lineEntrance = spring({
    frame: frame - 45,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <FadeTransition durationInFrames={durationInFrames} fadeIn={10} fadeOut={12}>
      <AbsoluteFill>
        {/* Dark background image with overlay */}
        <Img
          src={staticFile("images/scene1_hook.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.25) saturate(0.7)",
          }}
        />

        {/* Gradient overlay */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(74, 222, 128, ${glowIntensity * 0.15}) 0%, transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)`,
          }}
        />

        {/* Content */}
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* Big animated number */}
          <AnimatedCounter
            value={40}
            suffix="%"
            fontSize={140}
            color="#4ADE80"
            delay={8}
          />

          {/* Subtitle text */}
          <div
            style={{
              opacity: interpolate(lineEntrance, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(lineEntrance, [0, 1], [20, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 36,
                fontWeight: 600,
                color: "#FFFFFF",
                textAlign: "center",
                lineHeight: 1.4,
                maxWidth: 800,
                padding: "0 40px",
              }}
            >
              of healthcare appointments
            </div>
            <div
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 42,
                fontWeight: 800,
                color: "#F87171",
                textAlign: "center",
                lineHeight: 1.4,
                letterSpacing: "-0.02em",
              }}
            >
              end in no-shows
            </div>
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: interpolate(lineEntrance, [0, 1], [0, 200]),
              height: 3,
              backgroundColor: "#4ADE80",
              borderRadius: 2,
              marginTop: 10,
              boxShadow: "0 0 20px rgba(74, 222, 128, 0.5)",
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </FadeTransition>
  );
};
