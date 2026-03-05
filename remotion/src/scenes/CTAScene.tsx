import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FadeTransition } from "../components/FadeTransition";

/**
 * Scene 5: CTA — Zavis branding + "Book a Demo"
 * Clean branded endcard with animated elements.
 * Duration: 3 seconds (90 frames at 30fps)
 */
export const CTAScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoEntrance = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 120, mass: 0.8 },
  });

  // CTA button entrance
  const ctaEntrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  // URL entrance
  const urlEntrance = spring({
    frame: frame - 40,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  // Subtle floating particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    x: 15 + (i * 12) % 80,
    y: 10 + (i * 17) % 80,
    size: 3 + (i % 3) * 2,
    speed: 0.3 + (i % 4) * 0.15,
    opacity: 0.15 + (i % 3) * 0.1,
  }));

  // Pulsing glow
  const pulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.6, 1]);

  return (
    <FadeTransition durationInFrames={durationInFrames} fadeIn={10} fadeOut={8}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 40%, #1B2838 100%)",
        }}
      >
        {/* Floating particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y + Math.sin(frame * p.speed * 0.05 + i) * 3}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: "#4ADE80",
              opacity: p.opacity * pulse,
            }}
          />
        ))}

        {/* Radial glow behind logo */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(74,222,128,${0.12 * pulse}) 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              opacity: interpolate(logoEntrance, [0, 1], [0, 1]),
              transform: `scale(${interpolate(logoEntrance, [0, 1], [0.5, 1])})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Z logo */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 24,
                background: "linear-gradient(135deg, #4ADE80, #22C55E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 60px rgba(74,222,128,${0.3 * pulse})`,
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 56,
                  fontWeight: 800,
                  color: "#FFF",
                }}
              >
                Z
              </span>
            </div>

            {/* Brand name */}
            <div
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 52,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "0.08em",
              }}
            >
              ZAVIS
            </div>

            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 20,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              AI-Powered Patient Engagement
            </div>
          </div>

          {/* CTA Button */}
          <div
            style={{
              opacity: interpolate(ctaEntrance, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(ctaEntrance, [0, 1], [30, 0])}px)`,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #4ADE80, #22C55E)",
                padding: "18px 60px",
                borderRadius: 16,
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#FFF",
                letterSpacing: "0.02em",
                boxShadow: `0 8px 32px rgba(74,222,128,${0.35 * pulse})`,
              }}
            >
              Book a Demo
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              opacity: interpolate(urlEntrance, [0, 1], [0, 1]),
              fontFamily: "system-ui, sans-serif",
              fontSize: 22,
              color: "#4ADE80",
              letterSpacing: "0.04em",
            }}
          >
            zavis.ai
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </FadeTransition>
  );
};
