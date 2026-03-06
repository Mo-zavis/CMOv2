"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { GoogleAdsConnectionBanner } from "@/components/shared/GoogleAdsConnectionBanner";
import { fetchAPI } from "@/lib/api";

interface CampaignMetric {
  campaignId: string;
  campaignName: string;
  status: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  costPerConversion: number;
}

interface PerformanceData {
  dateRange: { start: string; end: string };
  performance: {
    campaigns: CampaignMetric[];
    totals: {
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      averageCpa: number;
      averageRoas: number;
    };
  };
  keywords: Array<{
    keyword: string;
    matchType: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }> | null;
  searchTerms: Array<{
    searchTerm: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }> | null;
}

const DATE_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState(30);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const start = new Date(today.getTime() - selectedRange * 24 * 60 * 60 * 1000);
      const startDate = start.toISOString().slice(0, 10);
      const endDate = today.toISOString().slice(0, 10);

      let url = `/api/google-ads/reports?startDate=${startDate}&endDate=${endDate}`;
      if (selectedCampaignId) url += `&campaignId=${selectedCampaignId}`;

      const res = await fetchAPI(url);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to fetch analytics");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Failed to connect to Google Ads API");
    } finally {
      setLoading(false);
    }
  }, [selectedRange, selectedCampaignId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <GoogleAdsConnectionBanner />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-heading font-semibold text-base">
          Google Ads Analytics
        </h2>

        <div className="flex items-center gap-2">
          {DATE_RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => setSelectedRange(range.days)}
              className={`text-xs px-3 py-1.5 rounded transition-colors ${
                selectedRange === range.days
                  ? "bg-[#006828] text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-sm">Loading analytics...</p>
        </Card>
      )}

      {error && (
        <Card className="p-8 text-center border-amber-200 bg-amber-50/50">
          <p className="text-sm text-amber-800 font-medium">Could not load analytics</p>
          <p className="text-xs text-amber-600 mt-1">{error}</p>
        </Card>
      )}

      {!loading && !error && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Spend", value: formatUsd(data.performance.totals.spend) },
              { label: "Impressions", value: data.performance.totals.impressions.toLocaleString() },
              { label: "Clicks", value: data.performance.totals.clicks.toLocaleString() },
              { label: "CTR", value: `${(data.performance.totals.ctr * 100).toFixed(2)}%` },
              { label: "Conversions", value: String(data.performance.totals.conversions) },
              { label: "Avg CPA", value: formatUsd(data.performance.totals.averageCpa) },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-lg font-heading font-semibold mt-1 font-mono">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>

          {/* Campaign performance table */}
          <div>
            <h3 className="font-heading font-medium text-sm mb-3">
              Campaign Performance
            </h3>
            <Card className="overflow-hidden">
              {data.performance.campaigns.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-muted-foreground">No campaign data for this period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="text-left p-3 font-medium text-muted-foreground">Campaign</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Impressions</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Clicks</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">CTR</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Avg CPC</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Conv</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">CPA</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.performance.campaigns.map((c) => (
                        <tr
                          key={c.campaignId}
                          className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                          onClick={() => setSelectedCampaignId(
                            selectedCampaignId === c.campaignId ? null : c.campaignId
                          )}
                        >
                          <td className="p-3 font-medium">{c.campaignName}</td>
                          <td className="p-3 text-right">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              c.status === "ENABLED" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono">{c.impressions.toLocaleString()}</td>
                          <td className="p-3 text-right font-mono">{c.clicks.toLocaleString()}</td>
                          <td className="p-3 text-right font-mono">{(c.ctr * 100).toFixed(2)}%</td>
                          <td className="p-3 text-right font-mono">{formatUsd(c.averageCpc)}</td>
                          <td className="p-3 text-right font-mono">{c.conversions}</td>
                          <td className="p-3 text-right font-mono">{formatUsd(c.costPerConversion)}</td>
                          <td className="p-3 text-right font-mono font-medium">{formatUsd(c.spend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Spend pacing */}
          {data.performance.campaigns.length > 0 && (
            <div>
              <h3 className="font-heading font-medium text-sm mb-3">
                Spend Distribution
              </h3>
              <Card className="p-4 space-y-3">
                {data.performance.campaigns
                  .filter((c) => c.spend > 0)
                  .map((c) => {
                    const pct = data.performance.totals.spend > 0
                      ? (c.spend / data.performance.totals.spend) * 100
                      : 0;
                    return (
                      <div key={c.campaignId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs truncate max-w-[200px]">{c.campaignName}</span>
                          <span className="text-xs font-mono text-muted-foreground">{formatUsd(c.spend)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-[#006828] h-2 rounded-full transition-all"
                            style={{ width: `${Math.max(pct, 1)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </Card>
            </div>
          )}

          {/* Keywords and Search Terms (when a campaign is selected) */}
          {selectedCampaignId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Keywords */}
              {data.keywords && data.keywords.length > 0 && (
                <div>
                  <h3 className="font-heading font-medium text-sm mb-3">
                    Top Keywords
                  </h3>
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/30 border-b border-border">
                            <th className="text-left p-3 font-medium text-muted-foreground">Keyword</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Match</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Clicks</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Conv</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Spend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.keywords.slice(0, 15).map((kw, i) => (
                            <tr key={i} className="border-b border-border last:border-0">
                              <td className="p-3 font-mono">{kw.keyword}</td>
                              <td className="p-3 text-right text-muted-foreground">{kw.matchType}</td>
                              <td className="p-3 text-right font-mono">{kw.clicks}</td>
                              <td className="p-3 text-right font-mono">{kw.conversions}</td>
                              <td className="p-3 text-right font-mono">{formatUsd(kw.spend)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* Top Search Terms */}
              {data.searchTerms && data.searchTerms.length > 0 && (
                <div>
                  <h3 className="font-heading font-medium text-sm mb-3">
                    Top Search Terms
                  </h3>
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/30 border-b border-border">
                            <th className="text-left p-3 font-medium text-muted-foreground">Search Term</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Impr</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Clicks</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Conv</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Spend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.searchTerms.slice(0, 15).map((st, i) => (
                            <tr key={i} className="border-b border-border last:border-0">
                              <td className="p-3 font-mono">{st.searchTerm}</td>
                              <td className="p-3 text-right font-mono">{st.impressions.toLocaleString()}</td>
                              <td className="p-3 text-right font-mono">{st.clicks}</td>
                              <td className="p-3 text-right font-mono">{st.conversions}</td>
                              <td className="p-3 text-right font-mono">{formatUsd(st.spend)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Empty state when no data */}
          {data.performance.campaigns.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-sm text-muted-foreground mb-2">No performance data yet.</p>
              <p className="text-xs text-muted-foreground">
                Push campaigns to Google Ads and wait for data to accumulate, then return here to see performance.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
