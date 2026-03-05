"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { VersionTimeline } from "@/components/shared/VersionTimeline";
import { FeedbackPanel } from "@/components/shared/FeedbackPanel";
import { ApprovalBar } from "@/components/shared/ApprovalBar";
import { BrandCheckReport } from "@/components/shared/BrandCheckReport";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchAPI } from "@/lib/api";
import type { AssetStatus } from "@/lib/status-machine";

interface AssetData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  subtype: string | null;
  status: string;
  platform: string | null;
  currentVersion: number;
  metadata: string | null;
  versions: {
    id: string;
    version: number;
    filePath: string | null;
    content: string | null;
    changelog: string | null;
    metadata: string | null;
    createdAt: string;
    feedbacks: {
      id: string;
      author: string;
      type: string;
      comment: string;
      createdAt: string;
    }[];
  }[];
  brandChecks: {
    id: string;
    checkType: string;
    score: number | null;
    passed: boolean;
    details: string;
    versionNumber: number;
  }[];
}

function safeParse(json: string | null) {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return null; }
}

export default function AdDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const fetchAsset = useCallback(async () => {
    const res = await fetchAPI(`/api/assets/${id}`);
    if (res.ok) {
      const data = await res.json();
      setAsset(data);
      if (selectedVersion === null) setSelectedVersion(data.currentVersion);
    }
  }, [id, selectedVersion]);

  useEffect(() => { fetchAsset(); }, [fetchAsset]);

  if (!asset) return <div className="text-muted-foreground text-sm">Loading...</div>;

  const currentVersionData = asset.versions.find((v) => v.version === selectedVersion);
  const meta = safeParse(currentVersionData?.metadata ?? null);
  const assetMeta = safeParse(asset.metadata);
  const modelName = meta?.model || meta?.model_name || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-lg">{asset.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            {asset.platform && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded capitalize">
                {asset.platform.replace(/_/g, " ")}
              </span>
            )}
            {asset.subtype && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded capitalize">
                {asset.subtype.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {modelName && (
            <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded font-mono">
              {modelName}
            </span>
          )}
          <StatusBadge status={asset.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* Ad preview */}
          <Card className="p-6 space-y-4">
            {currentVersionData?.content ? (
              <div className="space-y-3">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {currentVersionData.content}
                </pre>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                No content for this version
              </div>
            )}
          </Card>

          {/* Ad metadata */}
          {assetMeta && (
            <Card className="p-4">
              <h3 className="font-heading font-medium text-sm mb-3">Ad Configuration</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {assetMeta.format && (
                  <div><span className="text-muted-foreground">Format:</span> <span className="font-medium capitalize">{assetMeta.format.replace(/_/g, " ")}</span></div>
                )}
                {assetMeta.cta && (
                  <div><span className="text-muted-foreground">CTA:</span> <span className="font-medium">{assetMeta.cta}</span></div>
                )}
                {assetMeta.landingUrl && (
                  <div className="col-span-2"><span className="text-muted-foreground">Landing:</span> <span className="font-medium font-mono">{assetMeta.landingUrl}</span></div>
                )}
                {assetMeta.targeting && (
                  <div className="col-span-2"><span className="text-muted-foreground">Targeting:</span> <span className="font-medium">{assetMeta.targeting}</span></div>
                )}
              </div>
            </Card>
          )}

          <ApprovalBar
            assetId={asset.id}
            currentStatus={asset.status as AssetStatus}
            onTransition={async (newStatus) => {
              await fetch(`/api/assets/${asset.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newStatus }),
              });
              fetchAsset();
            }}
          />

          {asset.brandChecks[0] && (
            <BrandCheckReport
              checkType={asset.brandChecks[0].checkType}
              score={asset.brandChecks[0].score}
              passed={asset.brandChecks[0].passed}
              details={JSON.parse(asset.brandChecks[0].details)}
            />
          )}

          <FeedbackPanel
            assetId={asset.id}
            onSubmit={async (data) => {
              await fetch(`/api/assets/${asset.id}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, versionId: currentVersionData?.id }),
              });
              fetchAsset();
            }}
          />
        </div>

        <div>
          <h3 className="font-heading font-medium text-sm mb-3">Versions</h3>
          <VersionTimeline
            versions={asset.versions}
            assetType="ad_creative"
            currentVersion={selectedVersion ?? asset.currentVersion}
            onVersionSelect={setSelectedVersion}
          />
        </div>
      </div>
    </div>
  );
}
