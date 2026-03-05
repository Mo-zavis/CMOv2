"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { VersionTimeline } from "@/components/shared/VersionTimeline";
import { FeedbackPanel } from "@/components/shared/FeedbackPanel";
import { ApprovalBar } from "@/components/shared/ApprovalBar";
import { BrandCheckReport } from "@/components/shared/BrandCheckReport";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StoryboardTable } from "@/components/video/StoryboardTable";
import type { VideoSceneData } from "@/components/video/StoryboardTable";
import { TimelineBar } from "@/components/video/TimelineBar";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoMetadataCard } from "@/components/video/VideoMetadataCard";
import { fetchAPI } from "@/lib/api";
import type { AssetStatus } from "@/lib/status-machine";

interface AssetData {
  id: string;
  title: string;
  description: string | null;
  type: string;
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
  scenes: VideoSceneData[];
}

interface VideoMeta {
  format?: string;
  dimensions?: string;
  fps?: number;
  targetDuration?: number;
  platform?: string;
  pillar?: string;
}

function parseVideoMeta(metadata: string | null): VideoMeta {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata) as VideoMeta;
  } catch {
    return {};
  }
}

export default function VideoDetailPage() {
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
  const videoMeta = parseVideoMeta(asset.metadata);

  const scenes = asset.scenes ?? [];
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const completedScenes = scenes.filter((s) => s.status === "COMPLETE").length;
  const failedScenes = scenes.filter((s) => s.status === "FAILED").length;

  // Parse model name from version metadata
  const versionMeta = currentVersionData?.metadata
    ? (() => {
        try {
          return JSON.parse(currentVersionData.metadata as string);
        } catch {
          return null;
        }
      })()
    : null;
  const modelName =
    versionMeta?.model ||
    versionMeta?.model_name ||
    versionMeta?.generationModel ||
    null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-heading font-semibold text-lg">{asset.title}</h2>
          {asset.description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {asset.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {modelName && (
            <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded font-mono">
              {modelName}
            </span>
          )}
          {videoMeta.dimensions && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
              {videoMeta.dimensions}
            </span>
          )}
          {videoMeta.format && (
            <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-1 rounded">
              {videoMeta.format}
            </span>
          )}
          {asset.platform && (
            <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-1 rounded">
              {asset.platform.replace(/_/g, " ")}
            </span>
          )}
          <StatusBadge status={asset.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Storyboard table — THE PRIMARY VIEW */}
          <StoryboardTable scenes={scenes} />

          {/* Timeline bar */}
          <TimelineBar
            scenes={scenes.map((s) => ({
              sceneNumber: s.sceneNumber,
              duration: s.duration,
              status: s.status,
              compositionType: s.compositionType,
              title: s.title,
            }))}
            totalDuration={totalDuration}
          />

          {/* Video player — final render */}
          {currentVersionData?.filePath && (
            <VideoPlayer
              src={`/api/files/${currentVersionData.filePath}`}
              label="Final Render"
            />
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

        {/* Sidebar - 1 col */}
        <div className="space-y-4">
          {/* Video metadata */}
          <VideoMetadataCard
            metadata={videoMeta}
            sceneStats={{
              total: scenes.length,
              complete: completedScenes,
              failed: failedScenes,
            }}
          />

          {/* Version timeline */}
          <div>
            <h3 className="font-heading font-medium text-sm mb-3">Versions</h3>
            <VersionTimeline
              versions={asset.versions}
              assetType="video"
              currentVersion={selectedVersion ?? asset.currentVersion}
              onVersionSelect={setSelectedVersion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
