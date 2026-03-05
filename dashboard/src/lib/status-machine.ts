export type AssetStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "PUBLISHED";

const VALID_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REVISION_REQUESTED"],
  REVISION_REQUESTED: ["DRAFT"],
  APPROVED: ["PUBLISHED", "REVISION_REQUESTED"],
  PUBLISHED: [],
};

export function canTransition(
  from: AssetStatus,
  to: AssetStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAvailableTransitions(status: AssetStatus): AssetStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}

export function validateTransition(
  from: AssetStatus,
  to: AssetStatus
): { valid: boolean; error?: string } {
  if (!VALID_TRANSITIONS[from]) {
    return { valid: false, error: `Unknown status: ${from}` };
  }
  if (!canTransition(from, to)) {
    const available = getAvailableTransitions(from);
    return {
      valid: false,
      error: `Cannot transition from ${from} to ${to}. Valid transitions: ${available.join(", ") || "none"}`,
    };
  }
  return { valid: true };
}

export const STATUS_LABELS: Record<AssetStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  REVISION_REQUESTED: "Revision Requested",
  APPROVED: "Approved",
  PUBLISHED: "Published",
};

export const STATUS_COLORS: Record<AssetStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  REVISION_REQUESTED: "bg-red-100 text-red-700",
  APPROVED: "bg-green-100 text-green-700",
  PUBLISHED: "bg-blue-100 text-blue-700",
};
