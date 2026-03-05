"use client";

import { cn } from "@/lib/utils";
import { CalendarEventBar, type NormalizedEvent } from "./CalendarEventBar";

interface CalendarDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: NormalizedEvent[];
  onEventClick: (event: NormalizedEvent) => void;
}

const MAX_VISIBLE = 3;

export function CalendarDayCell({
  date,
  isCurrentMonth,
  isToday,
  events,
  onEventClick,
}: CalendarDayCellProps) {
  const visibleEvents = events.slice(0, MAX_VISIBLE);
  const overflow = events.length - MAX_VISIBLE;

  return (
    <div
      className={cn(
        "border-r border-b border-border min-h-[120px] p-1.5 transition-colors",
        isCurrentMonth ? "bg-white" : "bg-gray-50/50",
        !isCurrentMonth && "opacity-40"
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-xs font-medium inline-flex items-center justify-center",
            isToday &&
              "bg-[#006828] text-white w-6 h-6 rounded-full",
            !isToday && "text-muted-foreground"
          )}
        >
          {date.getDate()}
        </span>
      </div>

      {/* Event bars */}
      <div className="flex flex-col gap-0.5">
        {visibleEvents.map((event) => (
          <CalendarEventBar
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
        {overflow > 0 && (
          <button className="text-[10px] text-muted-foreground hover:text-foreground text-left px-1 cursor-pointer">
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
}
