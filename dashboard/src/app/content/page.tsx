import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/shared/AssetCard";
import { Card } from "@/components/ui/card";

export default async function ContentPage() {
  const assets = await prisma.asset.findMany({
    where: { type: "copy" },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">
          Content ({assets.length})
        </h2>
      </div>

      {assets.length === 0 ? (
        <Card className="p-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground/40"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <p className="text-muted-foreground text-sm">
            No content written yet. Ask the CMO agent to create blog posts, ad copy, or landing page content.
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
                latestFilePath={null}
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
