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

export default function ContentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const fetchAsset = useCallback(async () => {
    const res = await fetchAPI(`/api/assets/${id}`);
    if (res.ok) {
      const data = await res.json();
      setAsset(data);
      if (selectedVersion === null) {
        setSelectedVersion(data.currentVersion);
      }
    }
  }, [id, selectedVersion]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  if (!asset) {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  const currentVersionData = asset.versions.find(
    (v) => v.version === selectedVersion
  );
  const latestBrandCheck = asset.brandChecks[0];

  // Parse metadata for SEO info and model
  const meta = currentVersionData?.metadata
    ? (() => { try { return JSON.parse(currentVersionData.metadata as string); } catch { return null; } })()
    : null;
  const modelName = meta?.model || meta?.model_name || meta?.generationModel || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-heading font-semibold text-lg">{asset.title}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {asset.subtype && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded capitalize">
                {asset.subtype.replace(/_/g, " ")}
              </span>
            )}
            {asset.platform && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded capitalize">
                {asset.platform}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Content preview */}
          <Card className="p-6">
            {currentVersionData?.content ? (
              <div className="prose prose-sm max-w-none">
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

          {/* Metadata row */}
          {meta && (
            <div className="flex gap-4 text-xs text-muted-foreground">
              {meta.word_count && <span>Words: {meta.word_count}</span>}
              {meta.surfer_score && <span>SEO: {meta.surfer_score}/100</span>}
              {meta.readability && <span>Readability: {meta.readability}</span>}
              {meta.pillar_connection && (
                <span className="capitalize">
                  Pillar: {meta.pillar_connection.replace(/_/g, " ")}
                </span>
              )}
            </div>
          )}

          {/* Approval bar */}
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

          {/* Brand check */}
          {latestBrandCheck && (
            <BrandCheckReport
              checkType={latestBrandCheck.checkType}
              score={latestBrandCheck.score}
              passed={latestBrandCheck.passed}
              details={JSON.parse(latestBrandCheck.details)}
            />
          )}

          {/* Feedback panel */}
          <FeedbackPanel
            assetId={asset.id}
            onSubmit={async (data) => {
              await fetch(`/api/assets/${asset.id}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...data,
                  versionId: currentVersionData?.id,
                }),
              });
              fetchAsset();
            }}
          />
        </div>

        {/* Version timeline - 1 col */}
        <div>
          <h3 className="font-heading font-medium text-sm mb-3">Versions</h3>
          <VersionTimeline
            versions={asset.versions}
            assetType="copy"
            currentVersion={selectedVersion ?? asset.currentVersion}
            onVersionSelect={setSelectedVersion}
          />
        </div>
      </div>
    </div>
  );
}
