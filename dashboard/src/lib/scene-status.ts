export type SceneStatus =
  | "PENDING"
  | "FRAME_READY"
  | "CLIP_READY"
  | "VOICEOVER_READY"
  | "COMPLETE"
  | "FAILED";

export const SCENE_STATUS_LABELS: Record<SceneStatus, string> = {
  PENDING: "Pending",
  FRAME_READY: "Frame Ready",
  CLIP_READY: "Clip Ready",
  VOICEOVER_READY: "Voiceover Ready",
  COMPLETE: "Complete",
  FAILED: "Failed",
};

export const SCENE_STATUS_COLORS: Record<SceneStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  FRAME_READY: "bg-cyan-100 text-cyan-700",
  CLIP_READY: "bg-blue-100 text-blue-700",
  VOICEOVER_READY: "bg-violet-100 text-violet-700",
  COMPLETE: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

export const COMPOSITION_TYPE_LABELS: Record<string, string> = {
  veo_only: "Veo",
  veo_plus_remotion: "Veo + Remotion",
  remotion_only: "Remotion",
  still_image: "Still",
};

export const COMPOSITION_TYPE_COLORS: Record<string, string> = {
  veo_only: "bg-blue-100 text-blue-700",
  veo_plus_remotion: "bg-purple-100 text-purple-700",
  remotion_only: "bg-orange-100 text-orange-700",
  still_image: "bg-gray-100 text-gray-600",
};
