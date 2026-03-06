export type AssetStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "PUBLISHED"
  | "LIVE"
  | "PERFORMING"
  | "UNDERPERFORMING"
  | "OPTIMIZING"
  | "PAUSED";

const VALID_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REVISION_REQUESTED"],
  REVISION_REQUESTED: ["DRAFT"],
  APPROVED: ["PUBLISHED", "REVISION_REQUESTED"],
  PUBLISHED: ["LIVE"],
  LIVE: ["PERFORMING", "UNDERPERFORMING", "PAUSED"],
  PERFORMING: ["UNDERPERFORMING", "PAUSED"],
  UNDERPERFORMING: ["OPTIMIZING", "PAUSED"],
  OPTIMIZING: ["LIVE"],
  PAUSED: ["LIVE"],
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
  LIVE: "Live",
  PERFORMING: "Performing",
  UNDERPERFORMING: "Underperforming",
  OPTIMIZING: "Optimizing",
  PAUSED: "Paused",
};

export const STATUS_COLORS: Record<AssetStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  REVISION_REQUESTED: "bg-red-100 text-red-700",
  APPROVED: "bg-green-100 text-green-700",
  PUBLISHED: "bg-blue-100 text-blue-700",
  LIVE: "bg-emerald-100 text-emerald-700",
  PERFORMING: "bg-green-100 text-green-700",
  UNDERPERFORMING: "bg-orange-100 text-orange-700",
  OPTIMIZING: "bg-violet-100 text-violet-700",
  PAUSED: "bg-gray-100 text-gray-500",
};

// Campaign-level statuses
export type CampaignStatus =
  | "PLANNING"
  | "ACTIVE"
  | "MONITORING"
  | "OPTIMIZING"
  | "PAUSED"
  | "COMPLETED";

const CAMPAIGN_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  PLANNING: ["ACTIVE"],
  ACTIVE: ["MONITORING", "PAUSED"],
  MONITORING: ["OPTIMIZING", "COMPLETED", "PAUSED"],
  OPTIMIZING: ["MONITORING", "PAUSED"],
  PAUSED: ["ACTIVE", "MONITORING"],
  COMPLETED: [],
};

export function getCampaignTransitions(status: CampaignStatus): CampaignStatus[] {
  return CAMPAIGN_TRANSITIONS[status] ?? [];
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  MONITORING: "Monitoring",
  OPTIMIZING: "Optimizing",
  PAUSED: "Paused",
  COMPLETED: "Completed",
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  PLANNING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  MONITORING: "bg-blue-100 text-blue-700",
  OPTIMIZING: "bg-violet-100 text-violet-700",
  PAUSED: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-gray-100 text-gray-700",
};
