import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { staticFile } from "remotion";
import { KenBurns } from "../components/KenBurns";
import { FadeTransition } from "../components/FadeTransition";

/**
 * Scene 4: Demo — Simulated booking confirmation flow
 * Animated mock phone UI showing the patient journey.
 * Duration: 6 seconds (180 frames at 30fps)
 */
export const DemoScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1.2 },
  });

  // Chat messages stagger in
  const messages = [
    { text: "Hi! Your appointment with Dr. Patel is tomorrow at 10:00 AM. Can you confirm?", from: "bot", delay: 25 },
    { text: "Yes, I'll be there! ✓", from: "user", delay: 55 },
    { text: "Great! We've sent a calendar invite. See you tomorrow! 📅", from: "bot", delay: 80 },
    { text: "Need to reschedule? No problem — tap below to pick a new time.", from: "bot", delay: 110 },
  ];

  // Result stats that appear
  const resultEntrance = spring({
    frame: frame - 130,
    fps,
    config: { damping: 20, stiffness: 90 },
  });

  return (
    <FadeTransition durationInFrames={durationInFrames} fadeIn={12} fadeOut={12}>
      <AbsoluteFill>
        {/* Background */}
        <KenBurns
          src={staticFile("images/scene4_demo.jpg")}
          durationInFrames={durationInFrames}
          direction="zoom-out"
          intensity={0.06}
        />

        {/* Dark overlay */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.98) 100%)",
          }}
        />

        {/* Phone mockup */}
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          {/* Phone frame */}
          <div
            style={{
              opacity: interpolate(phoneEntrance, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(phoneEntrance, [0, 1], [80, 0])}px) scale(${interpolate(phoneEntrance, [0, 1], [0.9, 1])})`,
              width: 380,
              backgroundColor: "#1A1A2E",
              borderRadius: 32,
              border: "2px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Phone header - WhatsApp style */}
            <div
              style={{
                background: "linear-gradient(135deg, #075E54, #128C7E)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4ADE80, #22C55E)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#FFF",
                }}
              >
                Z
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#FFF",
                  }}
                >
                  Zavis Health
                </div>
                <div
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  AI Assistant • Online
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                minHeight: 320,
                background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 4\"><rect fill=\"%23111827\" width=\"4\" height=\"4\"/><rect fill=\"%23161B2E\" x=\"0\" y=\"0\" width=\"1\" height=\"1\"/></svg>') repeat",
                backgroundColor: "#0B1120",
              }}
            >
              {messages.map((msg, i) => {
                const msgEntrance = spring({
                  frame: frame - msg.delay,
                  fps,
                  config: { damping: 18, stiffness: 100 },
                });

                const isBot = msg.from === "bot";

                return (
                  <div
                    key={i}
                    style={{
                      opacity: interpolate(msgEntrance, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(msgEntrance, [0, 1], [15, 0])}px)`,
                      alignSelf: isBot ? "flex-start" : "flex-end",
                      maxWidth: "85%",
                      backgroundColor: isBot
                        ? "rgba(255,255,255,0.08)"
                        : "#075E54",
                      padding: "10px 14px",
                      borderRadius: isBot
                        ? "4px 14px 14px 14px"
                        : "14px 4px 14px 14px",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 14,
                      color: "#FFF",
                      lineHeight: 1.4,
                    }}
                  >
                    {msg.text}
                  </div>
                );
              })}
            </div>

            {/* Reschedule button */}
            <div
              style={{
                padding: "12px 16px 16px",
                backgroundColor: "#0B1120",
              }}
            >
              <div
                style={{
                  opacity: interpolate(resultEntrance, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(resultEntrance, [0, 1], [0.95, 1])})`,
                  background: "linear-gradient(135deg, #4ADE80, #22C55E)",
                  padding: "12px",
                  borderRadius: 10,
                  textAlign: "center",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#FFF",
                  letterSpacing: "0.02em",
                }}
              >
                📅 Reschedule Appointment
              </div>
            </div>
          </div>

          {/* Result stat below phone */}
          <div
            style={{
              opacity: interpolate(resultEntrance, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(resultEntrance, [0, 1], [20, 0])}px)`,
              marginTop: 30,
              display: "flex",
              gap: 30,
              justifyContent: "center",
            }}
          >
            {[
              { label: "Response Rate", value: "94%", color: "#4ADE80" },
              { label: "No-Show Drop", value: "–62%", color: "#60A5FA" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 36,
                    fontWeight: 800,
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </FadeTransition>
  );
};
