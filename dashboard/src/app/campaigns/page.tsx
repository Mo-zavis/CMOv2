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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-base">
          Campaigns ({campaigns.length})
        </h2>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-sm">
            No campaigns yet. Use the CMO agent to create a marketing campaign
            with targeting, budgets, and deliverables.
          </p>
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
                <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                  {/* Row 1: Title + status + pillar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading font-semibold text-sm">
                        {campaign.name}
                      </h3>
                      {campaign.pillar && (
                        <span className="text-[10px] uppercase tracking-wider bg-[#006828]/10 text-[#006828] px-2 py-0.5 rounded">
                          {campaign.pillar.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.budget && (
                        <span className="text-xs text-muted-foreground font-mono">
                          ${campaign.budget.toLocaleString()}
                        </span>
                      )}
                      <StatusBadge status={campaign.status} />
                    </div>
                  </div>

                  {campaign.objective && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {campaign.objective}
                    </p>
                  )}

                  {/* Row 2: Targeting summary */}
                  {targeting && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {targeting.locations?.map((loc) => (
                        <span
                          key={loc}
                          className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded"
                        >
                          {loc}
                        </span>
                      ))}
                      {targeting.age_range && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                          Age: {targeting.age_range[0]}-{targeting.age_range[1]}
                        </span>
                      )}
                      {targeting.job_titles
                        ?.slice(0, 3)
                        .map((jt) => (
                          <span
                            key={jt}
                            className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded"
                          >
                            {jt}
                          </span>
                        ))}
                      {(targeting.job_titles?.length ?? 0) > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{targeting.job_titles!.length - 3} more
                        </span>
                      )}
                      {targeting.industries?.map((ind) => (
                        <span
                          key={ind}
                          className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Row 3: Channels + metrics */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {channels && channels.length > 0 && (
                        <span>
                          Channels: {channels.join(", ")}
                        </span>
                      )}
                      <span>
                        {campaign.assets.length} assets ({approvedCount} approved)
                      </span>
                      {totalCreatives > 0 && (
                        <span>{totalCreatives} creatives</span>
                      )}
                      {campaign.adGroups.length > 0 && (
                        <span>{campaign.adGroups.length} ad groups</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
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
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
