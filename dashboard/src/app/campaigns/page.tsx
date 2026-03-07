import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";

interface TargetingData {
  locations?: string[];
  age_range?: [string, string];
  gender?: string;
  job_titles?: string[];
  industries?: string[];
  audience_segments?: string[];
  languages?: string[];
}

interface KpiData {
  target_cpa?: number;
  target_roas?: number;
  [key: string]: unknown;
}

function safeParse<T = Record<string, unknown>>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function getStatusBorderColor(status: string): string {
  switch (status) {
    case "ACTIVE":
    case "MONITORING":
      return "border-l-[#006828]";
    case "PLANNING":
      return "border-l-amber-400";
    case "OPTIMIZING":
      return "border-l-blue-400";
    case "PAUSED":
      return "border-l-red-400";
    default:
      return "border-l-gray-300";
  }
}

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      assets: {
        select: { id: true, type: true, status: true },
      },
      adGroups: {
        include: { _count: { select: { creatives: true } } },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1c]">
            Campaigns
          </h2>
          <span className="text-sm text-muted-foreground mt-1">
            {campaigns.length} total
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage marketing campaigns with targeting, budgets, and deliverables.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006828]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              No campaigns yet. Use the CMO agent to create a marketing campaign
              with targeting, budgets, and deliverables.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const targeting = safeParse<TargetingData>(campaign.targeting);
            const kpis = safeParse<KpiData>(campaign.kpis);
            const channels = safeParse<string[]>(campaign.channels);
            const assetsByType: Record<string, number> = {};
            campaign.assets.forEach((a) => {
              assetsByType[a.type] = (assetsByType[a.type] || 0) + 1;
            });
            const approvedCount = campaign.assets.filter(
              (a) => a.status === "APPROVED" || a.status === "PUBLISHED"
            ).length;
            const totalCreatives = campaign.adGroups.reduce(
              (sum, g) => sum + g._count.creatives,
              0
            );

            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card
                  className={`p-0 overflow-hidden hover:shadow-lg hover:border-[#006828]/20 transition-all duration-200 cursor-pointer border-l-[3px] ${getStatusBorderColor(campaign.status)}`}
                >
                  <div className="p-5">
                    {/* Row 1: Title + status + pillar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-heading font-semibold text-sm text-[#1c1c1c]">
                          {campaign.name}
                        </h3>
                        {campaign.pillar && (
                          <span className="text-[10px] uppercase tracking-wider bg-[#006828]/10 text-[#006828] px-2 py-0.5 rounded-full font-medium">
                            {campaign.pillar.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {campaign.budget && (
                          <span className="text-xs text-muted-foreground font-mono">
                            ${campaign.budget.toLocaleString()}
                          </span>
                        )}
                        <StatusBadge status={campaign.status} />
                      </div>
                    </div>

                    {campaign.objective && (
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                        {campaign.objective}
                      </p>
                    )}

                    {/* Row 2: Targeting summary */}
                    {targeting && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {targeting.locations?.map((loc) => (
                          <span
                            key={loc}
                            className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full"
                          >
                            {loc}
                          </span>
                        ))}
                        {targeting.age_range && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                            Age: {targeting.age_range[0]}-{targeting.age_range[1]}
                          </span>
                        )}
                        {targeting.job_titles
                          ?.slice(0, 3)
                          .map((jt) => (
                            <span
                              key={jt}
                              className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full"
                            >
                              {jt}
                            </span>
                          ))}
                        {(targeting.job_titles?.length ?? 0) > 3 && (
                          <span className="text-[10px] text-muted-foreground px-1">
                            +{targeting.job_titles!.length - 3} more
                          </span>
                        )}
                        {targeting.industries?.map((ind) => (
                          <span
                            key={ind}
                            className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-[#ecebe8] pt-3">
                      {/* Row 3: Channels + metrics */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {channels && channels.length > 0 && (
                            <>
                              <span>
                                Channels: {channels.join(", ")}
                              </span>
                              <span className="text-[#ecebe8]">/</span>
                            </>
                          )}
                          <span>
                            {campaign.assets.length} assets ({approvedCount} approved)
                          </span>
                          {totalCreatives > 0 && (
                            <>
                              <span className="text-[#ecebe8]">/</span>
                              <span>{totalCreatives} creatives</span>
                            </>
                          )}
                          {campaign.adGroups.length > 0 && (
                            <>
                              <span className="text-[#ecebe8]">/</span>
                              <span>{campaign.adGroups.length} ad groups</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {kpis?.target_cpa && (
                            <span>Target CPA: ${kpis.target_cpa}</span>
                          )}
                          {kpis?.target_roas && (
                            <span>Target ROAS: {kpis.target_roas}x</span>
                          )}
                          {campaign.startDate && (
                            <span>
                              {new Date(campaign.startDate).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                              {campaign.endDate &&
                                ` - ${new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
