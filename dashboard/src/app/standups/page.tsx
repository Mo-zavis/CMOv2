"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchAPI } from "@/lib/api";

interface StandupItem {
  id: string;
  category: string;
  content: string;
  priority: string;
  context: string | null;
  response: string | null;
  resolved: boolean;
  resolvedAt: string | null;
}

interface StandupSession {
  id: string;
  sessionDate: string;
  status: string;
  summary: string | null;
  items: StandupItem[];
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-700 border-gray-200" },
  ACTIVE: { label: "Active", className: "bg-amber-50 text-amber-700 border-amber-200" },
  AWAITING_RESPONSE: { label: "Awaiting Response", className: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "Completed", className: "bg-green-50 text-[#006828] border-green-200" },
};

const CATEGORY_STYLES: Record<string, { label: string; borderColor: string }> = {
  DONE: { label: "Done", borderColor: "border-l-green-500" },
  PLANNED: { label: "Planned", borderColor: "border-l-blue-500" },
  BLOCKED: { label: "Blocked", borderColor: "border-l-red-500" },
  PERMISSION: { label: "Permission", borderColor: "border-l-amber-500" },
  DEPENDENCY: { label: "Dependency", borderColor: "border-l-purple-500" },
  INSIGHT: { label: "Insight", borderColor: "border-l-teal-500" },
  RESEARCH_NEEDED: { label: "Research Needed", borderColor: "border-l-orange-500" },
};

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
};

export default function StandupsPage() {
  const [sessions, setSessions] = useState<StandupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAPI("/api/standups")
      .then((res) => res.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : data.sessions || []);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupItemsByCategory = (items: StandupItem[]) => {
    const groups: Record<string, StandupItem[]> = {};
    for (const item of items) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[#1c1c1c]">
          Standups
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daily alignment sessions between the CMO and the team.
        </p>
      </div>

      <Separator />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Loading standups...
        </div>
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No standup sessions yet. The CMO will create daily standups to align
            on priorities, surface blockers, and request permissions.
          </p>
        </Card>
      )}

      {/* Timeline */}
      {!loading && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isExpanded = expandedId === session.id;
            const statusStyle = STATUS_STYLES[session.status] || STATUS_STYLES.PENDING;
            const grouped = groupItemsByCategory(session.items || []);

            return (
              <Card
                key={session.id}
                className="overflow-hidden cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => toggleExpanded(session.id)}
              >
                {/* Session header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {/* Timeline dot */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        session.status === "COMPLETED"
                          ? "bg-[#006828]"
                          : session.status === "ACTIVE"
                          ? "bg-amber-500"
                          : session.status === "AWAITING_RESPONSE"
                          ? "bg-blue-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <div>
                      <p className="font-heading text-sm font-medium text-[#1c1c1c]">
                        {formatDate(session.sessionDate)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(session.items || []).length} item
                        {(session.items || []).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusStyle.className}`}
                    >
                      {statusStyle.label}
                    </Badge>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                    {Object.keys(grouped).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No items in this session.
                      </p>
                    )}

                    {Object.entries(grouped).map(([category, items]) => {
                      const catStyle =
                        CATEGORY_STYLES[category] || {
                          label: category,
                          borderColor: "border-l-gray-400",
                        };

                      return (
                        <div key={category}>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                            {catStyle.label}
                          </p>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className={`border-l-4 ${catStyle.borderColor} bg-[#f8f8f6] rounded-r-md p-3`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm text-[#1c1c1c]">
                                    {item.content}
                                  </p>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {(item.priority === "HIGH" ||
                                      item.priority === "URGENT") && (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] ${
                                          PRIORITY_STYLES[item.priority]
                                        }`}
                                      >
                                        {item.priority}
                                      </Badge>
                                    )}
                                    {item.resolved && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] bg-green-50 text-[#006828] border-green-200"
                                      >
                                        Resolved
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {item.response && (
                                  <div className="mt-2 pl-3 border-l-2 border-[#ecebe8]">
                                    <p className="text-xs text-muted-foreground">
                                      Response:
                                    </p>
                                    <p className="text-sm text-[#1c1c1c] mt-0.5">
                                      {item.response}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Summary */}
                    {session.status === "COMPLETED" && session.summary && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                            Summary
                          </p>
                          <p className="text-sm text-[#1c1c1c]">
                            {session.summary}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
