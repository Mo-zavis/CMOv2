"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { LoopStepper } from "@/components/loops/LoopStepper";
import { MetricCard } from "@/components/loops/MetricCard";
import { OptimizationTimeline } from "@/components/loops/OptimizationTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";

interface LoopData {
  id: string;
  loopType: string;
  currentPhase: string;
  cycleNumber: number;
  status: string;
  campaignId?: string | null;
  updatedAt: string;
}

interface ChannelPerf {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
}

interface OptimizationItem {
  id: string;
  decisionType: string;
  rationale: string;
  status: string;
  campaignId?: string | null;
  createdAt: string;
}

interface CommandCenterData {
  northStar: {
    totalTarget: number;
    totalActual: number;
    campaigns: Array<{ id: string; name: string; target: number; actual: number }>;
    trend: Array<{ date: string; value: number }>;
  };
  activeLoops: Array<LoopData & { campaignName?: string }>;
  channelPerformance: Record<string, ChannelPerf>;
  recentOptimizations: OptimizationItem[];
  assetStats: {
    total: number;
    inReview: number;
    approved: number;
    published: number;
    live: number;
  };
}

const CHANNEL_LABELS: Record<string, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  linkedin: "LinkedIn",
  organic_search: "Organic Search",
  social: "Social Media",
  email: "Email",
  overall: "Overall",
};

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CommandCenterPage() {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchAPI("/api/command-center");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // API may not exist yet in static mode
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading command center...</div>;
  }

  // Fallback for when no data exists yet
  const ns = data?.northStar ?? { totalTarget: 0, totalActual: 0, campaigns: [], trend: [] };
  const loops = data?.activeLoops ?? [];
  const channels = data?.channelPerformance ?? {};
  const optimizations = data?.recentOptimizations ?? [];
  const stats = data?.assetStats ?? { total: 0, inReview: 0, approved: 0, published: 0, live: 0 };

  const progressPct = ns.totalTarget > 0 ? Math.min(100, (ns.totalActual / ns.totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading font-semibold text-base">Command Center</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          North star metrics, active loops, and optimization decisions
        </p>
      </div>

      {/* Row 1: North Star */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              North Star: Demo Bookings
            </p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-heading font-bold text-[#006828]">
                {ns.totalActual}
              </span>
              {ns.totalTarget > 0 && (
                <span className="text-sm text-muted-foreground">
                  / {ns.totalTarget} target
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-heading font-semibold text-foreground">{stats.total}</p>
              <p>Assets</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-semibold text-amber-600">{stats.inReview}</p>
              <p>In Review</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-semibold text-green-600">{stats.approved}</p>
              <p>Approved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-semibold text-blue-600">{stats.published + stats.live}</p>
              <p>Live</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {ns.totalTarget > 0 && (
          <div className="space-y-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006828] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">
              {progressPct.toFixed(0)}% of target
            </p>
          </div>
        )}

        {/* Per-campaign breakdown */}
        {ns.campaigns.length > 0 && (
          <div className="mt-4 space-y-2">
            {ns.campaigns.map((c) => {
              const pct = c.target > 0 ? Math.min(100, (c.actual / c.target) * 100) : 0;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <Link href={`/campaigns/${c.id}`} className="text-xs font-medium hover:underline min-w-[120px] truncate">
                    {c.name}
                  </Link>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#006828]/60 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-16 text-right">
                    {c.actual}/{c.target}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Row 2: Active Loops */}
      <div>
        <h3 className="font-heading font-medium text-sm mb-3">Active Loops ({loops.length})</h3>
        {loops.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No active loops. Start an agentic loop by running a pipeline script.
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId &lt;id&gt; --phase research
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loops.map((loop) => (
              <Card key={loop.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    {loop.campaignName && (
                      <p className="text-xs font-medium">{loop.campaignName}</p>
                    )}
                  </div>
                  <StatusBadge status={loop.status} />
                </div>
                <LoopStepper
                  loopType={loop.loopType}
                  currentPhase={loop.currentPhase}
                  cycleNumber={loop.cycleNumber}
                />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    Updated {new Date(loop.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Row 3: Channel Performance */}
      {Object.keys(channels).length > 0 && (
        <div>
          <h3 className="font-heading font-medium text-sm mb-3">Channel Performance (Last 30 Days)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(channels).map(([channel, perf]) => (
              <Card key={channel} className="p-0 overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 border-b border-border">
                  <p className="text-xs font-medium">{CHANNEL_LABELS[channel] || channel}</p>
                </div>
                <div className="grid grid-cols-2">
                  <MetricCard label="Spend" value={formatCurrency(perf.spend)} />
                  <MetricCard label="Impressions" value={formatNum(perf.impressions)} />
                  <MetricCard label="Clicks" value={formatNum(perf.clicks)} />
                  <MetricCard
                    label="CPA"
                    value={perf.conversions > 0 ? formatCurrency(perf.cpa) : "---"}
                    status={perf.cpa > 0 && perf.cpa < 30 ? "good" : perf.cpa > 50 ? "bad" : "warning"}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Recent Optimization Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-heading font-medium text-sm mb-3">Recent Optimizations</h3>
          <Card className="p-4">
            <OptimizationTimeline items={optimizations} />
          </Card>
        </div>

        {/* Quick Reference */}
        <div>
          <h3 className="font-heading font-medium text-sm mb-3">Quick Actions</h3>
          <Card className="p-4 space-y-3">
            <div className="space-y-2">
              {[
                { label: "Start Ads Loop", cmd: "npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase research" },
                { label: "Pull Google Ads Metrics", cmd: "npx tsx scripts/google-ads-client.ts pull-metrics --campaignId <id>" },
                { label: "Pull Meta Ads Metrics", cmd: "npx tsx scripts/meta-ads-client.ts pull-metrics --campaignId <id>" },
                { label: "View Loop Status", cmd: "npx tsx scripts/db-writer.ts loop-status" },
                { label: "View Metrics", cmd: "npx tsx scripts/db-writer.ts metrics-summary --channel google_ads" },
              ].map((action) => (
                <div key={action.label} className="space-y-0.5">
                  <p className="text-xs font-medium">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    {action.cmd}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
