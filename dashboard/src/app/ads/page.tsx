import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/shared/AssetCard";
import { Card } from "@/components/ui/card";
import { GoogleAdsConnectionBanner } from "@/components/shared/GoogleAdsConnectionBanner";

export default async function AdsPage() {
  const assets = await prisma.asset.findMany({
    where: { type: "ad_creative" },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-8">
      <GoogleAdsConnectionBanner />

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">
          Ad Creatives ({assets.length})
        </h2>
      </div>

      {assets.length === 0 ? (
        <Card className="p-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground/40"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <p className="text-muted-foreground text-sm">
            No ad creatives yet. Use the CMO agent to generate ads for Google, Meta, and LinkedIn campaigns.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((asset) => {
            const latestVersion = asset.versions[0];
            return (
              <AssetCard
                key={asset.id}
                id={asset.id}
                type={asset.type}
                title={asset.title}
                status={asset.status}
                platform={asset.platform}
                currentVersion={asset.currentVersion}
                latestFilePath={latestVersion?.filePath}
                latestContent={latestVersion?.content}
                latestMetadata={latestVersion?.metadata}
                createdAt={asset.createdAt.toISOString()}
                updatedAt={asset.updatedAt.toISOString()}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
