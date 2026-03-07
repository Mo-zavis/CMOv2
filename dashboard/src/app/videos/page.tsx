import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/shared/AssetCard";
import { Card } from "@/components/ui/card";

export default async function VideosPage() {
  const assets = await prisma.asset.findMany({
    where: { type: "video" },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
      scenes: { orderBy: { sceneNumber: "asc" } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">
          Videos ({assets.length})
        </h2>
      </div>

      {assets.length === 0 ? (
        <Card className="p-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground/40"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <p className="text-muted-foreground text-sm">
            No videos created yet. Use the video producer skill to create
            storyboard-driven video content.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((asset) => {
            const latestVersion = asset.versions[0];
            const sceneCount = asset.scenes.length;
            const completedScenes = asset.scenes.filter(
              (s) => s.status === "COMPLETE"
            ).length;
            const totalDuration = asset.scenes.reduce(
              (sum, s) => sum + s.duration,
              0
            );

            return (
              <div key={asset.id} className="space-y-1">
                <AssetCard
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
                {sceneCount > 0 && (
                  <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                    <span>
                      {sceneCount} scenes ({completedScenes} ready)
                    </span>
                    <span className="font-mono">{totalDuration}s</span>
                    {/* Mini progress bar */}
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(completedScenes / sceneCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
