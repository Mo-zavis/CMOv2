"use client";

import { Button } from "@/components/ui/button";
import { type AssetStatus, getAvailableTransitions, STATUS_LABELS } from "@/lib/status-machine";

interface ApprovalBarProps {
  assetId: string;
  currentStatus: AssetStatus;
  onTransition: (newStatus: AssetStatus) => Promise<void>;
}

const TRANSITION_STYLES: Partial<Record<AssetStatus, string>> = {
  IN_REVIEW: "bg-amber-600 hover:bg-amber-600/90 text-white",
  APPROVED: "bg-[#006828] hover:bg-[#006828]/90 text-white",
  REVISION_REQUESTED: "bg-red-600 hover:bg-red-600/90 text-white",
  PUBLISHED: "bg-blue-600 hover:bg-blue-600/90 text-white",
  DRAFT: "bg-gray-600 hover:bg-gray-600/90 text-white",
};

export function ApprovalBar({
  currentStatus,
  onTransition,
}: ApprovalBarProps) {
  const available = getAvailableTransitions(currentStatus);

  if (available.length === 0) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-card border rounded-lg">
      <span className="text-sm text-muted-foreground mr-auto">
        Current: <strong>{STATUS_LABELS[currentStatus]}</strong>
      </span>
      {available.map((status) => (
        <Button
          key={status}
          size="sm"
          className={TRANSITION_STYLES[status] ?? ""}
          onClick={() => onTransition(status)}
        >
          {status === "IN_REVIEW" && "Submit for Review"}
          {status === "APPROVED" && "Approve"}
          {status === "REVISION_REQUESTED" && "Request Revision"}
          {status === "PUBLISHED" && "Publish"}
          {status === "DRAFT" && "Back to Draft"}
        </Button>
      ))}
    </div>
  );
}
