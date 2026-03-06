"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  IN_REVIEW: { label: "In Review", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  REVISION_REQUESTED: { label: "Revision Requested", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  PUBLISHED: { label: "Published", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  PLANNING: { label: "Planning", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  ACTIVE: { label: "Active", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  PAUSED: { label: "Paused", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
  COMPLETED: { label: "Completed", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  SYNCED: { label: "Synced", className: "bg-sky-100 text-sky-700 hover:bg-sky-100" },
  SYNC_PENDING: { label: "Sync Pending", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
  GOOGLE_ENABLED: { label: "Enabled", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  GOOGLE_PAUSED: { label: "Paused (GA)", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
  AD_DISAPPROVED: { label: "Disapproved", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
