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

/**
 * Scene 3: Solution — Zavis AI agents + WhatsApp reminders
 * Dashboard image with animated feature cards sliding in.
 * Duration: 8 seconds (240 frames at 30fps)
 */
export const SolutionScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    {
      icon: "💬",
      title: "WhatsApp Reminders",
      desc: "Automated, personalized reminders 48h & 2h before appointments",
      color: "#25D366",
      delay: 30,
    },
    {
      icon: "🤖",
      title: "AI Rescheduling",
      desc: "Instant rebooking when patients need to change",
      color: "#60A5FA",
      delay: 55,
    },
    {
      icon: "📊",
      title: "Smart Analytics",
      desc: "Predict no-shows before they happen",
      color: "#A78BFA",
      delay: 80,
    },
    {
      icon: "⚡",
      title: "Fill Empty Slots",
      desc: "Automatically offer open slots to waitlisted patients",
      color: "#FBBF24",
      delay: 105,
    },
  ];

  const headerEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <FadeTransition durationInFrames={durationInFrames} fadeIn={12} fadeOut={12}>
      <AbsoluteFill>
        {/* Background */}
        <KenBurns
          src={staticFile("images/scene3_solution.jpg")}
          durationInFrames={durationInFrames}
          direction="pan-right"
          intensity={0.08}
        />

        {/* Overlay */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(16,24,40,0.92) 0%, rgba(16,24,40,0.96) 50%, rgba(16,24,40,0.98) 100%)",
          }}
        />

        {/* Content */}
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "60px 50px",
            gap: 20,
          }}
        >
          {/* Header */}
          <div
            style={{
              opacity: interpolate(headerEntrance, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(headerEntrance, [0, 1], [-20, 0])}px)`,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {/* Zavis brand badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(74, 222, 128, 0.15)",
                padding: "10px 24px",
                borderRadius: 24,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#4ADE80",
                  boxShadow: "0 0 10px rgba(74,222,128,0.6)",
                }}
              />
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#4ADE80",
                  letterSpacing: "0.05em",
                }}
              >
                ZAVIS AI
              </span>
            </div>

            <div
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 40,
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Your AI-Powered{"\n"}Patient Engagement
            </div>
          </div>

          {/* Feature cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {features.map((f, i) => {
              const entrance = spring({
                frame: frame - f.delay,
                fps,
                config: { damping: 18, stiffness: 90 },
              });

              return (
                <div
                  key={i}
                  style={{
                    opacity: interpolate(entrance, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(entrance, [0, 1], [60, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    padding: "18px 22px",
                    borderRadius: 14,
                    border: `1px solid ${f.color}30`,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: `${f.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      flexShrink: 0,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: f.color,
                        marginBottom: 2,
                      }}
                    >
                      {f.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 16,
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.3,
                      }}
                    >
                      {f.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </FadeTransition>
  );
};
