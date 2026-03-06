"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";

interface OptimizationItem {
  id: string;
  decisionType: string;
  rationale: string;
  status: string;
  campaignId?: string | null;
  createdAt: string;
}

interface OptimizationTimelineProps {
  items: OptimizationItem[];
}

const TYPE_LABELS: Record<string, string> = {
  budget_realloc: "Budget Reallocation",
  targeting_change: "Targeting Change",
  creative_swap: "Creative Swap",
  keyword_add: "Keyword Addition",
  keyword_pause: "Keyword Pause",
  bid_adjust: "Bid Adjustment",
  channel_pause: "Channel Pause",
  content_refresh: "Content Refresh",
};

export function OptimizationTimeline({ items }: OptimizationTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No optimization decisions yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <div className="mt-1 w-2 h-2 rounded-full bg-[#006828] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium">
                {TYPE_LABELS[item.decisionType] || item.decisionType}
              </span>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
              {item.rationale}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
