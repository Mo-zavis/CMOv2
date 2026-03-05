"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getEventTypeMeta } from "@/lib/calendar-events";
import { fetchAPI } from "@/lib/api";
import { CalendarDayCell } from "./CalendarDayCell";
import type { NormalizedEvent } from "./CalendarEventBar";
import Link from "next/link";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarDays(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const startDay = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();

  const prevMonth = new Date(year, month, 0);
  const prevDays: Date[] = [];
  for (let i = startDay - 1; i >= 0; i--) {
    prevDays.push(new Date(year, month - 1, prevMonth.getDate() - i));
  }

  const currentDays: Date[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentDays.push(new Date(year, month, i));
  }

  const totalSoFar = prevDays.length + currentDays.length;
  const rows = Math.ceil(totalSoFar / 7);
  const totalCells = rows * 7;
  const nextDays: Date[] = [];
  for (let i = 1; i <= totalCells - totalSoFar; i++) {
    nextDays.push(new Date(year, month + 1, i));
  }

  return [...prevDays, ...currentDays, ...nextDays];
}

function eventFallsOnDay(event: NormalizedEvent, day: Date): boolean {
  const eventDate = new Date(event.date);
  if (isSameDay(eventDate, day)) return true;

  if (event.endDate) {
    const endDate = new Date(event.endDate);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const eventStart = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    const eventEnd = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );
    return dayStart >= eventStart && dayStart <= eventEnd;
  }

  return false;
}

const EVENT_TYPE_ROUTES: Record<string, { path: string; label: string }> = {
  campaign_launch: { path: "/campaigns", label: "View campaign" },
  ad_start: { path: "/ads", label: "View ad creative" },
  social_post: { path: "/social", label: "View social post" },
  content_publish: { path: "/content", label: "View content" },
  email_send: { path: "/emails", label: "View email" },
};

function getSourceLink(event: NormalizedEvent): { href: string; label: string } | null {
  if (event.source === "campaign" && event.sourceId) {
    return { href: `/campaigns/${event.sourceId}`, label: "View campaign" };
  }
  if (event.source === "asset" && event.sourceId) {
    const route = EVENT_TYPE_ROUTES[event.eventType];
    if (route) {
      return { href: `${route.path}/${event.sourceId}`, label: route.label };
    }
    return { href: `/library`, label: "View in library" };
  }
  // Manual calendar events with assetId or campaignId encoded in metadata
  if (event.source === "manual") {
    // Check if there's a sourceId (which the API populates from assetId/campaignId)
    if (event.sourceId) {
      if (event.eventType === "campaign_launch") {
        return { href: `/campaigns/${event.sourceId}`, label: "View campaign" };
      }
      const route = EVENT_TYPE_ROUTES[event.eventType];
      if (route) {
        return { href: `${route.path}/${event.sourceId}`, label: route.label };
      }
    }
  }
  return null;
}

export function CalendarGrid() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const monthStr = `${currentMonth.year}-${String(
      currentMonth.month + 1
    ).padStart(2, "0")}`;
    try {
      const res = await fetchAPI(`/api/calendar/events?month=${monthStr}`);
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    }
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const goToPrevMonth = () =>
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToNextMonth = () =>
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToToday = () =>
    setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() });

  const days = getCalendarDays(currentMonth.year, currentMonth.month);

  const monthLabel = new Date(
    currentMonth.year,
    currentMonth.month
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={goToPrevMonth}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          <h2 className="font-heading font-semibold text-base min-w-[180px] text-center">
            {monthLabel}
          </h2>
          <Button variant="outline" size="icon-sm" onClick={goToNextMonth}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="border border-border rounded-lg overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[640px]">
          {/* Day-of-week headers */}
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="border-r border-b border-border last:border-r-0 px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center bg-gray-50/80"
            >
              {d}
            </div>
          ))}

          {/* Day cells */}
          {days.map((day, index) => {
            const dayEvents = events.filter((e) => eventFallsOnDay(e, day));
            return (
              <CalendarDayCell
                key={index}
                date={day}
                isCurrentMonth={day.getMonth() === currentMonth.month}
                isToday={isSameDay(day, today)}
                events={dayEvents}
                onEventClick={setSelectedEvent}
              />
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center text-xs text-muted-foreground py-2">
          Loading events...
        </div>
      )}

      {/* Event detail dialog */}
      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      >
        {selectedEvent && <EventDetailContent event={selectedEvent} />}
      </Dialog>
    </div>
  );
}

function EventDetailContent({ event }: { event: NormalizedEvent }) {
  const meta = getEventTypeMeta(event.eventType);
  const sourceLink = getSourceLink(event);

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const endDateStr = event.endDate
    ? new Date(event.endDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <DialogContent>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${meta.color} ${meta.textColor}`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: meta.dotColor }}
            />
            {meta.label}
          </span>
          {event.platform && (
            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {event.platform.replace(/_/g, " ")}
            </span>
          )}
        </div>
        <DialogTitle className="font-heading">{event.title}</DialogTitle>
        <DialogDescription>
          {dateStr}
          {endDateStr && ` \u2014 ${endDateStr}`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {event.description && (
          <p className="text-sm text-foreground">{event.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Status:{" "}
            <span className="font-medium text-foreground">{event.status}</span>
          </span>
          <span>
            Source:{" "}
            <span className="font-medium text-foreground capitalize">
              {event.source}
            </span>
          </span>
        </div>
      </div>

      {sourceLink && (
        <DialogFooter>
          <Link href={sourceLink.href}>
            <Button variant="outline" size="sm">
              {sourceLink.label}
            </Button>
          </Link>
        </DialogFooter>
      )}
    </DialogContent>
  );
}
