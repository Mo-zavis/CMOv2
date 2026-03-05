/**
 * Platform metadata mapping for social media integrations.
 * Maps Postiz `identifier` strings to display names, brand colors, and SVG icon paths.
 */

export interface PlatformMeta {
  name: string;
  color: string;
  category: "primary" | "secondary";
}

export const PLATFORMS: Record<string, PlatformMeta> = {
  // Primary platforms (most relevant for healthcare marketing)
  linkedin: { name: "LinkedIn", color: "#0A66C2", category: "primary" },
  x: { name: "X (Twitter)", color: "#000000", category: "primary" },
  facebook: { name: "Facebook", color: "#1877F2", category: "primary" },
  instagram: { name: "Instagram", color: "#E4405F", category: "primary" },
  youtube: { name: "YouTube", color: "#FF0000", category: "primary" },
  tiktok: { name: "TikTok", color: "#000000", category: "primary" },

  // Secondary platforms
  reddit: { name: "Reddit", color: "#FF4500", category: "secondary" },
  threads: { name: "Threads", color: "#000000", category: "secondary" },
  pinterest: { name: "Pinterest", color: "#E60023", category: "secondary" },
  bluesky: { name: "Bluesky", color: "#0085FF", category: "secondary" },
  mastodon: { name: "Mastodon", color: "#6364FF", category: "secondary" },
  discord: { name: "Discord", color: "#5865F2", category: "secondary" },
  slack: { name: "Slack", color: "#4A154B", category: "secondary" },
  medium: { name: "Medium", color: "#000000", category: "secondary" },
  devto: { name: "Dev.to", color: "#0A0A0A", category: "secondary" },
  hashnode: { name: "Hashnode", color: "#2962FF", category: "secondary" },
  wordpress: { name: "WordPress", color: "#21759B", category: "secondary" },
  telegram: { name: "Telegram", color: "#26A5E4", category: "secondary" },
  dribbble: { name: "Dribbble", color: "#EA4C89", category: "secondary" },
  lemmy: { name: "Lemmy", color: "#00BC8C", category: "secondary" },
  nostr: { name: "Nostr", color: "#8B5CF6", category: "secondary" },
  gmb: { name: "Google Business", color: "#4285F4", category: "secondary" },
};

export const PRIMARY_PLATFORMS = Object.entries(PLATFORMS)
  .filter(([, meta]) => meta.category === "primary")
  .map(([id, meta]) => ({ id, ...meta }));

export const SECONDARY_PLATFORMS = Object.entries(PLATFORMS)
  .filter(([, meta]) => meta.category === "secondary")
  .map(([id, meta]) => ({ id, ...meta }));

export function getPlatformMeta(identifier: string): PlatformMeta {
  return (
    PLATFORMS[identifier] ?? {
      name: identifier.charAt(0).toUpperCase() + identifier.slice(1),
      color: "#6B7280",
      category: "secondary" as const,
    }
  );
}
