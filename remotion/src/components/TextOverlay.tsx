import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type TextPosition = "center" | "bottom-third" | "top" | "bottom";

export const TextOverlay: React.FC<{
  text: string;
  position?: TextPosition;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  delay?: number;
  bold?: boolean;
  subtext?: string;
  subtextSize?: number;
}> = ({
  text,
  position = "center",
  fontSize = 48,
  color = "#FFFFFF",
  bgColor = "rgba(28, 28, 28, 0.75)",
  delay = 0,
  bold = true,
  subtext,
  subtextSize = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100, mass: 0.8 },
  });

  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const positionStyles: Record<TextPosition, React.CSSProperties> = {
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    "bottom-third": {
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: "20%",
    },
    top: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "12%",
    },
    bottom: {
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: "8%",
    },
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        ...positionStyles[position],
        zIndex: 10,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          backgroundColor: bgColor,
          padding: "20px 40px",
          borderRadius: 12,
          maxWidth: "85%",
          textAlign: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize,
            fontWeight: bold ? 700 : 400,
            color,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
          }}
        >
          {text}
        </div>
        {subtext && (
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: subtextSize,
              fontWeight: 400,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.4,
              marginTop: 12,
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
