import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";

async function getStats() {
  const [totalAssets, byStatus, byType, recentAssets] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ["status"], _count: true }),
    prisma.asset.groupBy({ by: ["type"], _count: true }),
    prisma.asset.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    }),
  ]);
  return { totalAssets, byStatus, byType, recentAssets };
}

export default async function DashboardPage() {
  const { totalAssets, byStatus, byType, recentAssets } = await getStats();

  const statusMap = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count])
  );
  const typeMap = Object.fromEntries(byType.map((t) => [t.type, t._count]));

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Assets
          </p>
          <p className="text-2xl font-heading font-semibold mt-1">
            {totalAssets}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            In Review
          </p>
          <p className="text-2xl font-heading font-semibold mt-1 text-amber-600">
            {statusMap["IN_REVIEW"] ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Approved
          </p>
          <p className="text-2xl font-heading font-semibold mt-1 text-green-600">
            {statusMap["APPROVED"] ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Published
          </p>
          <p className="text-2xl font-heading font-semibold mt-1 text-blue-600">
            {statusMap["PUBLISHED"] ?? 0}
          </p>
        </Card>
      </div>

      {/* Asset type breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { type: "image", label: "Images", href: "/images" },
          { type: "copy", label: "Content", href: "/content" },
          { type: "video", label: "Videos", href: "/videos" },
        ].map((item) => (
          <Link key={item.type} href={item.href}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-xl font-heading font-semibold mt-1">
                {typeMap[item.type] ?? 0}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent assets */}
      <div>
        <h2 className="font-heading font-semibold text-base mb-3">
          Recent Activity
        </h2>
        {recentAssets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No assets yet. Generate your first image or content piece using the CMO agent.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentAssets.map((asset) => (
              <Card key={asset.id} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-muted-foreground uppercase w-14 shrink-0">
                    {asset.type}
                  </span>
                  <span className="text-sm font-medium truncate">{asset.title}</span>
                  <StatusBadge status={asset.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground sm:shrink-0 pl-[68px] sm:pl-0">
                  <span>v{asset.currentVersion}</span>
                  <span>
                    {new Date(asset.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
