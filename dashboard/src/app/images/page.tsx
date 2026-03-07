import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/shared/AssetCard";
import { Card } from "@/components/ui/card";

export default async function ImagesPage() {
  const assets = await prisma.asset.findMany({
    where: { type: "image" },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1c]">
            Images
          </h2>
          <span className="text-sm text-muted-foreground mt-1">
            {assets.length} total
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Generated images for campaigns and brand assets.
        </p>
      </div>

      {assets.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006828]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              No images generated yet. Ask the CMO agent to create images for your campaigns.
            </p>
          </div>
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
                latestContent={null}
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
