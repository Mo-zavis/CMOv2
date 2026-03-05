"use client";

import { getEventTypeMeta } from "@/lib/calendar-events";
import { cn } from "@/lib/utils";

export interface NormalizedEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  endDate: string | null;
  eventType: string;
  platform: string | null;
  status: string;
  source: "manual" | "campaign" | "asset";
  sourceId: string | null;
}

interface CalendarEventBarProps {
  event: NormalizedEvent;
  onClick: () => void;
}

export function CalendarEventBar({ event, onClick }: CalendarEventBarProps) {
  const meta = getEventTypeMeta(event.eventType);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-full flex items-center gap-1 px-1.5 h-5 rounded text-[10px] truncate transition-colors cursor-pointer",
        meta.color,
        meta.textColor,
        "hover:brightness-95"
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: meta.dotColor }}
      />
      <span className="truncate">{event.title}</span>
      {event.endDate && (
        <span className="text-[9px] opacity-60 ml-auto shrink-0">
          {new Date(event.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}
    </button>
  );
}
