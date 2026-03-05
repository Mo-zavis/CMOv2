import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/shared/AssetCard";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  const assets = await prisma.asset.findMany({
    where: { type: "ad_creative" },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-base">
          Ad Creatives ({assets.length})
        </h2>
      </div>

      {assets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-sm">
            No ad creatives yet. Use the CMO agent to generate ads for Google, Meta, and LinkedIn campaigns.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
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
