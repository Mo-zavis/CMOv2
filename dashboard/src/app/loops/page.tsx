"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { LoopStepper } from "@/components/loops/LoopStepper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchAPI } from "@/lib/api";
import { LOOP_TYPES } from "@/lib/loop-types";
import Link from "next/link";

interface PhaseLog {
  id: string;
  phase: string;
  cycleNumber: number;
  status: string;
  output?: string | null;
  decisions?: string | null;
  duration?: number | null;
  createdAt: string;
}

interface LoopData {
  id: string;
  loopType: string;
  currentPhase: string;
  cycleNumber: number;
  status: string;
  campaignId?: string | null;
  config?: string | null;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  phases: PhaseLog[];
}

function safeParse(json: string | null | undefined): Record<string, unknown> | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function LoopsPage() {
  const [loops, setLoops] = useState<LoopData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLoop, setExpandedLoop] = useState<string | null>(null);

  const fetchLoops = useCallback(async () => {
    try {
      const res = await fetchAPI("/api/loops");
      if (res.ok) {
        setLoops(await res.json());
      }
    } catch {
      // API may not exist in static mode
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoops();
  }, [fetchLoops]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading loops...</div>;
  }

  const activeLoops = loops.filter((l) => l.status === "ACTIVE");
  const completedLoops = loops.filter((l) => l.status !== "ACTIVE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-base">Agentic Loops ({loops.length})</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cyclic marketing automation workflows
          </p>
        </div>
      </div>

      {loops.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No loops running. Start an agentic loop with the pipeline runner.
          </p>
          <div className="mt-4 space-y-2 text-left max-w-lg mx-auto">
            {Object.values(LOOP_TYPES).map((lt) => (
              <div key={lt.key} className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: lt.dotColor }}
                />
                <div>
                  <p className="text-xs font-medium">{lt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{lt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <>
          {/* Active Loops */}
          {activeLoops.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-heading font-medium text-sm">Active ({activeLoops.length})</h3>
              {activeLoops.map((loop) => {
                const loopDef = LOOP_TYPES[loop.loopType];
                const isExpanded = expandedLoop === loop.id;

                return (
                  <Card key={loop.id} className="p-0 overflow-hidden">
                    <button
                      onClick={() => setExpandedLoop(isExpanded ? null : loop.id)}
                      className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {loopDef && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${loopDef.color} ${loopDef.textColor}`}>
                              {loopDef.label}
                            </span>
                          )}
                          {loop.campaignId && (
                            <span className="text-xs text-muted-foreground">
                              Campaign: {loop.campaignId.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            Cycle {loop.cycleNumber}
                          </span>
                          <StatusBadge status={loop.status} />
                        </div>
                      </div>
                      <LoopStepper
                        loopType={loop.loopType}
                        currentPhase={loop.currentPhase}
                        cycleNumber={loop.cycleNumber}
                      />
                    </button>

                    {/* Expanded: Phase Logs */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-3 bg-muted/10 space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Phase History
                        </p>
                        {loop.phases.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No phase logs yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {loop.phases.map((phase) => {
                              const outputData = safeParse(phase.output);
                              return (
                                <div key={phase.id} className="flex items-start gap-2">
                                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                    phase.status === "COMPLETED" ? "bg-green-500" :
                                    phase.status === "IN_PROGRESS" ? "bg-blue-500" :
                                    phase.status === "FAILED" ? "bg-red-500" : "bg-gray-400"
                                  }`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium capitalize">{phase.phase}</span>
                                      <span className="text-[10px] text-muted-foreground">
                                        Cycle {phase.cycleNumber}
                                      </span>
                                      <StatusBadge status={phase.status} />
                                    </div>
                                    {outputData && (
                                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                        {JSON.stringify(outputData).slice(0, 200)}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">
                                      {new Date(phase.createdAt).toLocaleString("en-US", {
                                        month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                                      })}
                                      {phase.duration && ` (${phase.duration}s)`}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {loop.campaignId && (
                          <Link
                            href={`/campaigns/${loop.campaignId}`}
                            className="inline-block text-xs text-[#006828] hover:underline mt-2"
                          >
                            View Campaign
                          </Link>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Completed Loops */}
          {completedLoops.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-heading font-medium text-sm">
                Completed / Paused ({completedLoops.length})
              </h3>
              {completedLoops.map((loop) => {
                const loopDef = LOOP_TYPES[loop.loopType];
                return (
                  <Card key={loop.id} className="p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {loopDef && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${loopDef.color} ${loopDef.textColor}`}>
                            {loopDef.label}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {loop.cycleNumber} cycle{loop.cycleNumber > 1 ? "s" : ""}
                        </span>
                      </div>
                      <StatusBadge status={loop.status} />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
